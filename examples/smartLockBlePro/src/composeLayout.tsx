import _ from 'lodash';
import { Store } from 'redux';
import { NativeModules, NativeEventEmitter } from 'react-native';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { TYSdk, Theme, DevInfo, DpValue } from 'tuya-panel-kit';
import { Connect } from '@components';
import { actions } from '@models';
import { getDeviceActiveDate } from '@api';
import { dpCodes, theme, codeClassification, dpExist } from '@config';

const { getDpExist, getIdsByCodes } = dpExist;
const { passwordOfflineTime } = dpCodes;

interface Props {
  devInfo: DevInfo;
  extraInfo?: Record<string, any>;
  preload?: boolean;
}
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const { openDoorDpCodes } = codeClassification;

const composeLayout = (store: Store, component: React.ComponentType) => {
  const NavigatorLayout = component;

  // 获取色值 Json
  const readThemeJson = () => {
    NativeModules.TYRCTThemeManager.readThemeData(
      (success: { [key1: string]: { [key2: string]: string } }) =>
        actions.common.updateAppTheme(success),
      (error: string) => console.warn('appThemeConfiguration.init', error)
    );
  };

  TYEvent.on('deviceDataChange', data => {
    switch (data.type) {
      case 'dpData':
        actions.common.updateDp(data.payload as Record<string, DpValue>);
        break;
      case 'deviceOnline':
        actions.common.deviceChange(data.payload as DevInfo);
        actions.common.getBLEOnlineState();
        break;
      default:
        actions.common.deviceChange(data.payload as DevInfo);
        break;
    }
  });

  if (NativeModules.TYRCTThemeManager) {
    const eventEmitter = new NativeEventEmitter(NativeModules.TYRCTThemeManager);
    eventEmitter.addListener('themeChanged', () => {
      readThemeJson();
    });
  }

  class PanelComponent extends Component<Props> {
    constructor(props: Props) {
      super(props);
      if (NativeModules.TYRCTThemeManager) {
        readThemeJson();
      }

      if (props && props.extraInfo && !_.isEmpty(props.extraInfo)) {
        actions.common.extraInfoChange(props.extraInfo);
      }

      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo()
          .then(data => {
            actions.common.devInfoChange(data);
            actions.common.getBLEOnlineState();
            const { deviceOnline } = props.devInfo;
            if (deviceOnline) {
              getDeviceActiveDate().then((_date: number) => {
                TYSdk.device.putDeviceData({
                  [passwordOfflineTime]: _date.toString(),
                });
              });
            }
            return Promise.all([TYDevice.getDeviceState(), data]);
          })
          .then(([dpState, devInfo]) => {
            const isEqual = _.isEqual(dpState, devInfo.state);
            if (isEqual) return;
            actions.common.updateDp(dpState);
          });
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo()
          .then(data => {
            actions.common.devInfoChange(data);
          })
          .catch((e: Error) => {
            console.warn(e);
          });
      }
    }

    async componentDidMount() {
      actions.common.existDpChange(getDpExist());
      actions.common.getOpenDoorDpIds(getIdsByCodes(openDoorDpCodes));
    }

    render() {
      return (
        <Provider store={store}>
          <Theme theme={theme}>
            <Connect mapStateToProps={_.identity}>
              {({ mapStateToProps, ...props }: { mapStateToProps: any; [prop: string]: any }) => {
                const hasInit = Object.keys(props.dpState).length > 0;
                return hasInit ? <NavigatorLayout {...props} /> : null;
              }}
            </Connect>
          </Theme>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;

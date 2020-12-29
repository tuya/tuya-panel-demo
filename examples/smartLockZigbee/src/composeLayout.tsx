import _ from 'lodash';
import { Store } from 'redux';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { TYSdk, Theme, DevInfo, DpValue } from 'tuya-panel-kit';
import { Connect } from '@components';
import { actions } from '@models';
import { theme } from '@config';

interface Props {
  devInfo: DevInfo;
  preload?: boolean;
}

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const composeLayout = (store: Store, component: React.ComponentType) => {
  const NavigatorLayout = component;
  const { dispatch } = store;

  TYEvent.on('deviceDataChange', data => {
    switch (data.type) {
      case 'dpData':
        dispatch(actions.common.responseUpdateDp(data.payload as Record<string, DpValue>));
        break;
      default:
        dispatch(actions.common.deviceChange(data.payload as DevInfo));
        break;
    }
  });

  TYSdk.event.on('networkStateChange', data => {
    dispatch(actions.common.deviceChange(data as any));
  });

  class PanelComponent extends Component<Props> {
    constructor(props: Props) {
      super(props);
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo()
          .then(data => {
            dispatch(actions.common.devInfoChange(data));
            return Promise.all([TYDevice.getDeviceState(), data]);
          })
          .then(([dpState, devInfo]) => {
            const isEqual = _.isEqual(dpState, devInfo.state);
            if (isEqual) return;
            dispatch(actions.common.responseUpdateDp(dpState));
          });
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then(data => dispatch(actions.common.devInfoChange(data)));
      }
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

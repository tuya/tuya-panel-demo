import _ from 'lodash';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme, Utils } from 'tuya-panel-kit';
import gateway from './gateway';
import { Store } from 'redux';

import { devInfoChange, deviceChange, updateDp } from './redux/modules/common';
import theme from './theme';
import gatewayConfig from './config/dragon';
import { setDevInfo } from 'utils/index';

const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;
const TYEvent = TYSdk.event;

interface PanelProps {
  devInfo: object;
}

const {
  ThemeUtils: { ThemeConsumer },
} = Utils;

const composeLayout = (store: Store, component: any) => {
  const NavigatorLayoutContainer = connect(_.identity)(component);
  const { dispatch } = store;

  class PanelComponent extends Component<PanelProps> {
    constructor(props: any) {
      super(props);
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo().then((data: any) => {
          this.initData(data);
          dispatch(devInfoChange(data));
        });
        // eslint-disable-next-line
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then((data: any) => {
          this.initData(data);
          dispatch(devInfoChange(data));
        });
      }
      this.subscribe();
    }
    componentDidMount() {
      // 更新在进入面板未接收到dp的数据
      if (TYDevice.__unInitializeDps) {
        const newState = TYDevice.formatDps(TYDevice.__unInitializeDps);
        if (!_.isEmpty(newState)) {
          gateway.receiveDp(newState);
        }
      }
    }
    componentWillUnmount() {
      this.unsubscribe();
    }

    async initData(devInfo: any) {
      setDevInfo(devInfo);
      this.initDragon(devInfo);
    }

    initDragon(devInfo: any) {
      gateway.config({
        ...gatewayConfig,
        checkCurrent: !!devInfo.groupId,
        schema: devInfo.schema,
      });
      gateway.onDpChange((d: any) => dispatch(updateDp(d)));
      gateway.initDp(devInfo.state);
    }

    subscribe() {
      TYEvent.on('deviceDataChange', this.handleDeviceChange);
      TYEvent.on('networkStateChange', this._handleAppOnlineChange);
    }

    unsubscribe() {
      TYEvent.remove('deviceDataChange', this.handleDeviceChange);
      TYEvent.remove('networkStateChange', this._handleAppOnlineChange);
    }
    handleDeviceChange = ({ type, payload }: any) => {
      switch (type) {
        case 'dpData':
          this._handleDpDataChange(payload);
          break;
        default:
          this._handleDeviceChanged(payload);
      }
    };

    _handleDeviceChanged = (data: any) => {
      dispatch(deviceChange(data));
    };
    _handleDpDataChange = (data: any) => {
      gateway.receiveDp(data);
    };

    _handleAppOnlineChange = (data: any) => {
      dispatch(
        deviceChange({
          // ...this.props.devInfo,
          appOnline: data.online,
        })
      );
    };
    render() {
      return (
        <Provider store={store}>
          <Theme theme={theme}>
            <ThemeConsumer>{() => <NavigatorLayoutContainer />}</ThemeConsumer>
          </Theme>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;

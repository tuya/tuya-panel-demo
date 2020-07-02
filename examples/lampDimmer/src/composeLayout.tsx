import _ from 'lodash';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { View, Platform } from 'react-native';
import { TYSdk, Theme, Utils } from 'tuya-panel-kit';
import gateway from 'gateway';
import { Store } from 'redux';

import { devInfoChange, deviceChange, updateDp } from './redux/modules/common';
import themeData from './theme';
import gatewayConfig from './config/gateway';
import { initCloud, updateCloud } from './redux/modules/cloud';
import * as lampUtils from './utils';
import * as ApiUtils from './api';

interface PanelProps {
  devInfo: object;
}

const {
  ThemeUtils: { ThemeConsumer },
} = Utils;

const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;
const TYEvent = TYSdk.event;

const composeLayout = (store: Store, component: any) => {
  const NavigatorLayoutContainer = connect(_.identity)(component);
  const { dispatch } = store;

  class PanelComponent extends Component<PanelProps, { showPage: boolean }> {
    constructor(props: any) {
      super(props);
      this.state = {
        showPage: false,
      };
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo().then((data: any) => {
          lampUtils.setDevInfo(data);
          this.initData(data);
          dispatch(devInfoChange(data));
        });
        // eslint-disable-next-line
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then((data: any) => {
          lampUtils.setDevInfo(data);
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

    getMaxSupport(devInfo: any) {
      let schema = devInfo.schema;
      if (typeof schema === 'string') {
        schema = JSON.parse(schema);
      }
      const schemaObj: any = {};
      Object.keys(schema).forEach(key => {
        const item = schema[key];
        schemaObj[item.code] = item;
      });
      const codes = Object.keys(schemaObj);
      // 最大支持几路灯
      let supportMax = 1;
      while (supportMax) {
        const { brightCode } = lampUtils.getDpCodesByType(supportMax, schemaObj);
        if (codes.includes(brightCode)) {
          supportMax++;
        } else {
          break;
        }
      }
      return --supportMax;
    }

    async initData(devInfo: any) {
      this.initDragon(devInfo);
      // 最大支持调光数
      const supportMax = this.getMaxSupport(devInfo);
      dispatch(devInfoChange({ supportMax }));
      // 获取本地数据
      const cloudData = await ApiUtils.fetchLocalConfig();
      if (cloudData) {
        const initCloudData = this.handleCloudData(cloudData);
        dispatch(initCloud({ ...initCloudData }));
        // 同步数据
        ApiUtils.syncCloudConfig();
      } else {
        // todo show loading
        // 加载云端配置
        ApiUtils.fetchCloudConfig().then(cloudData => {
          const initCloudData = this.handleCloudData(cloudData);
          dispatch(initCloud({ ...initCloudData }));
        });
      }

      this.setState({ showPage: true });
    }

    initDragon(devInfo: any) {
      const { schema } = devInfo;
      let schemaValues: any = Utils.JsonUtils.parseJSON(schema);
      if (Platform.OS === 'android') {
        schemaValues = Object.keys(schemaValues).map(key => {
          return schemaValues[key];
        });
      }
      // @ts-ignore
      gateway.config({ ...gatewayConfig, checkCurrent: !devInfo.groupId, schema: schemaValues });
      gateway.onDpChange((d: any) => {
        if (Object.keys(d).length) {
          dispatch(updateDp(d));
        }
      });
      gateway.initDp(devInfo.state);
    }

    handleCloudData(cloudData: any) {
      // 初始化场景
      const result: any = {};
      Object.keys(cloudData).forEach(key => {
        const value = cloudData[key];
        if (typeof value === 'string') {
          try {
            result[key] = JSON.parse(value);
          } catch (e) {
            result[key] = value;
          }
        } else {
          result[key] = value;
        }
      });
      return result;
    }

    subscribe() {
      TYEvent.on('deviceDataChange', this.handleDeviceChange);
      TYEvent.on('networkStateChange', this._handleAppOnlineChange);

      // 同步数据事件
      TYEvent.on('beginSyncCloudData', this._handleBeginSyncCloudData);
      TYEvent.on('endSyncCloudData', this._handleEndSyncCloudData);
      TYEvent.on('syncCloudDataError', this._handleErrorSyncCloudData);
    }

    unsubscribe() {
      TYEvent.remove('deviceDataChange', this.handleDeviceChange);
      TYEvent.remove('networkStateChange', this._handleAppOnlineChange);

      TYEvent.remove('beginSyncCloudData', this._handleBeginSyncCloudData);
      TYEvent.remove('endSyncCloudData', this._handleEndSyncCloudData);
      TYEvent.remove('syncCloudDataError', this._handleErrorSyncCloudData);
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

    _handleDeviceOnlineChange = (data: any) => {
      dispatch(
        deviceChange({
          // ...this.props.devInfo,
          deviceOnline: data.online,
        })
      );
    };

    _handleBeginSyncCloudData = (data: any) => {
      console.log('开始同步数据');
    };
    _handleEndSyncCloudData = (data: any) => {
      const cloudData = this.handleCloudData(data);
      dispatch(updateCloud({ ...cloudData }));
    };
    _handleErrorSyncCloudData = (data: any) => {
      console.log('同步失败数据');
    };
    render() {
      const { showPage } = this.state;
      if (!showPage) {
        return <View style={{ flex: 1 }} />;
      }
      return (
        <Provider store={store}>
          <Theme theme={themeData}>
            <ThemeConsumer>{() => <NavigatorLayoutContainer />}</ThemeConsumer>
          </Theme>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;

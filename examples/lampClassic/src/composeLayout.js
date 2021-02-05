import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View } from 'react-native';
import { Provider, connect } from 'react-redux';
import _get from 'lodash/get';
import camelCase from 'camelcase';
import { TYSdk, Theme, Utils, Dialog } from 'tuya-panel-kit';
import { devInfoChange, deviceChange, updateDp } from './redux/modules/common';
import Config from './config';
import { initCloud } from './redux/modules/cloud';
import { isCapability } from './utils';
import * as DpUtils from './utils/dpUtils';
import Strings from './i18n';
import { fetchSceneDefaultValue } from './config/default/scenes';

const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;
const TYEvent = TYSdk.event;

const {
  ThemeUtils: { ThemeConsumer },
} = Utils;

const composeLayout = (store, component) => {
  const NavigatorLayoutContainer = connect(_.identity)(component);
  const { dispatch } = store;

  class PanelComponent extends Component {
    static propTypes = {
      devInfo: PropTypes.any.isRequired,
    };
    /* eslint-disable */
    state = { initFinish: false };
    
    constructor(props) {
      super(props);
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        this.initData(props.devInfo);
        TYDevice.getDeviceInfo().then(data => {
          dispatch(devInfoChange(data));
          this.setState({ initFinish: true });
        });
        // eslint-disable-next-line
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then(data => {
          this.initData(data);
          dispatch(devInfoChange(data));
          this.setState({ initFinish: true });
        });
      }
      this.subscribe();
    }

    componentDidMount() {
      // 更新在进入面板未接收到dp的数据
      if (TYDevice.__unInitializeDps) {
        const newState = TYDevice.__unInitializeDps;
        if (!_.isEmpty(newState)) {
          dispatch(updateDp(newState));
        }
      }
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    initData(devInfo) {
      const { schema } = devInfo;
      const schemaData = Utils.JsonUtils.parseJSON(schema);
      const codes = {};
      const schemaValues = [];
      // eslint-disable-next-line
      for (let p in schemaData) {
        const { code } = schemaData[p];
        codes[camelCase(code)] = code;
        schemaValues.push(schemaData[p]);
      }

      const {
        switchLed: switchLedCode,
        colourData: colourCode,
        workMode: workModeCode,
        tempValue: tempValueCode,
        brightValue: brightValueCode,
        sceneData: sceneDataCode,
        musicData: musicDataCode,
        countdown: countdownCode,
      } = codes;

      if (!switchLedCode) {
        Dialog.alert({
          title: Strings.getLang('requirementMissing'),
          confirmText: Strings.getLang('confirm'),
        });
      }
      const workModeSchema = schemaValues.find(({ code }) => code === 'work_mode') || {};
      const property = Utils.JsonUtils.parseJSON(_get(workModeSchema, 'property') || {});
      const workModeRange = _get(property, 'range') || [];

      const capabilityFun = {
        isZigbee: isCapability(12, devInfo.capability),
        isSignMesh: isCapability(15, devInfo.capability),
      };

      const isSupportColor = !!colourCode && workModeRange.indexOf('colour') !== -1;
      const isSupportWhiteTemp = !!tempValueCode;
      const isSupportWhiteBright = !!brightValueCode;
      const isSupportScene = !!sceneDataCode;
      const isSupportWhite =
        workModeRange.indexOf('white') !== -1 && (isSupportWhiteTemp || isSupportWhiteBright);
      const isSupportMusic = workModeRange.indexOf('music') !== -1 && !!musicDataCode;
      let isSupportCountdown = !!countdownCode;

      const isGroupDevice = !!devInfo.groupId;

      if (isGroupDevice) {
        isSupportCountdown = false;
      }

      const dpFun = {
        isSupportColor,
        isSupportWhite,
        isSupportWhiteTemp,
        isSupportWhiteBright,
        isSupportScene,
        isSupportMusic,
        isSupportCountdown,
      };

      const defaultScenes = fetchSceneDefaultValue(dpFun); // 默认场景列表
      // 去拉取场景配置
      if (isSupportScene) {
        TYNative.getDeviceCloudData()
          .then(data => {
            const scenes = defaultScenes.map(item => {
              const key = `scene_${item.sceneId}`;
              if (Reflect.has(data, key)) {
                const jsonData = JSON.parse(data[key]);
                return {
                  ...item,
                  value: jsonData.value || item.value,
                };
              }
              return {
                ...item,
              };
            });
            store.dispatch(initCloud({ ...data, scenes }));
          })
          .catch(e => {
            store.dispatch(initCloud({ scenes: defaultScenes }));
            store.warn(new Error('fetch Cloud data failure'));
          });
      }

      // 更新 Config 数据
      Object.assign(Config, { defaultScenes, dpFun, capabilityFun });
    }

    subscribe() {
      TYEvent.on('deviceDataChange', this.handleDeviceChange);
      TYEvent.on('networkStateChange', this._handleAppOnlineChange);
    }

    unsubscribe() {
      TYEvent.remove('deviceDataChange', this.handleDeviceChange);
      TYEvent.remove('networkStateChange', this._handleAppOnlineChange);
    }

    handleDeviceChange = ({ type, payload }) => {
      switch (type) {
        case 'dpData':
          this._handleDpDataChange(payload);
          break;
        default:
          this._handleDeviceChanged(payload);
      }
    };

    _handleDeviceChanged = data => {
      dispatch(deviceChange(data));
    };

    _handleDpDataChange = data => {
      const result = DpUtils.handleFilterData(data);
      if (Object.keys(result).length) {
        store.dispatch(updateDp(result));
      }
    };

    _handleAppOnlineChange = data => {
      dispatch(deviceChange(data));
    };

    render() {
      // eslint-disable-next-line react/destructuring-assignment
      if (!this.state.initFinish) {
        return <View style={{ flex: 1 }} />;
      }
      const { theme } = Config;
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

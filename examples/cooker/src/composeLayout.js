import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View } from 'react-native';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme } from 'tuya-panel-kit';
import Config from './config';
import { devInfoChange, deviceChange, updateDp } from './redux/modules/common';
import { getWorkStateFromDpState } from './redux/modules/workState';
import theme from './config/theme';

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const composeLayout = (store, component) => {
  const NavigatorLayoutContainer = connect(_.identity)(component);
  const { dispatch, getState } = store;

  TYEvent.on('deviceDataChange', data => {
    const State = getState();
    switch (data.type) {
      case 'dpData':
        dispatch(updateDp(data.payload));
        getWorkStateFromDpState(dispatch)(data, State.workState);
        break;
      default:
        dispatch(deviceChange(data.payload));
        break;
    }
  });

  // eslint-disable-next-line
  TYEvent.on('networkStateChange', data => {
    dispatch(deviceChange(data));
  });

  class PanelComponent extends Component {
    static propTypes = {
      // eslint-disable-next-line
      devInfo: PropTypes.object.isRequired,
    };

    constructor(props) {
      super(props);

      this.state = {
        init: false,
      };
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo().then(data => {
          dispatch(devInfoChange(data));
          Config.buildConfig(props.devInfo.schema);
          Config.setDevInfo(props.devInfo);
          getWorkStateFromDpState(dispatch)(data.state, {});
          this._projectInit();
        });
        // eslint-disable-next-line
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then(data => {
          dispatch(devInfoChange(data));
          Config.buildConfig(data.devInfo.schema);
          Config.setDevInfo(data.devInfo);
          getWorkStateFromDpState(dispatch)(data.state, {});
          this._projectInit();
        });
      }
    }

    _projectInit = () => {
      setTimeout(() => {
        this.setState({ init: true });
      }, 0);
    };

    render() {
      return (
        <Provider store={store}>
          <Theme theme={theme}>{this.state.init ? <NavigatorLayoutContainer /> : <View />}</Theme>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;

import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme } from 'tuya-panel-kit';
import { devInfoChange, deviceChange, responseUpdateDp } from './redux/modules/common';
import { getSwitchNamesAsync, getLastSwitchTimersAsync } from './redux/modules/switchState';
import theme from './config/theme';

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const composeLayout = (store, component) => {
  let switchCodes;
  const NavigatorLayoutContainer = connect(_.identity)(component);
  const { dispatch } = store;

  TYEvent.on('deviceDataChange', data => {
    switch (data.type) {
      case 'dpData':
        dispatch(responseUpdateDp(data.payload));
        break;
      default:
        dispatch(deviceChange(data.payload));
        break;
    }
  });

  TYEvent.on('networkStateChange', data => {
    dispatch(deviceChange(data));
  });

  TYEvent.on('linkageTimeUpdate', () => {
    if (!switchCodes) return;
    dispatch(getLastSwitchTimersAsync(switchCodes));
  });

  class PanelComponent extends Component {
    static propTypes = {
      // eslint-disable-next-line
      devInfo: PropTypes.object.isRequired,
    };

    constructor(props) {
      super(props);
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo().then(this._handleDevInfoInit);
        // eslint-disable-next-line
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then(this._handleDevInfoInit);
      }
    }

    getCodesFromSchema(schema, regex) {
      const switches = _.filter(schema || {}, (v, key) => regex.test(key));
      switchCodes = switches.map(dp => dp.code);
      return switchCodes;
    }

    _handleDevInfoInit = data => {
      const codes = this.getCodesFromSchema(data.schema, /^switch_[\d]+$/);
      dispatch(devInfoChange(data));
      dispatch(getSwitchNamesAsync(codes));
      dispatch(getLastSwitchTimersAsync(codes));
    };

    render() {
      return (
        <Provider store={store}>
          <Theme theme={theme}>
            <NavigatorLayoutContainer />
          </Theme>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;

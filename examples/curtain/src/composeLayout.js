import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme } from 'tuya-panel-kit';
import {
  devInfoChange,
  deviceChange,
  responseUpdateDp,
  dpCodesChange,
} from './redux/modules/common';
import theme from './config/theme';
import { parseDpCodes } from './utils';

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const composeLayout = (store, component) => {
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

  // eslint-disable-next-line
  TYEvent.on('networkStateChange', data => {
    dispatch(deviceChange(data));
  });

  class PanelComponent extends Component {
    // eslint-disable-next-line react/static-property-placement
    static propTypes = {
      devInfo: PropTypes.object.isRequired,
    };

    constructor(props) {
      super(props);
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo().then(data => {
          dispatch(devInfoChange(data));
          dispatch(dpCodesChange(parseDpCodes(data)));
        });
        // eslint-disable-next-line
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then(data => {
          dispatch(devInfoChange(data));
          dispatch(dpCodesChange(parseDpCodes(data)));
        });
      }
    }

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

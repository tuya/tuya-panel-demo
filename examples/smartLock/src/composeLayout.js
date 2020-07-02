import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme } from 'tuya-panel-kit';
import { devInfoChange, deviceChange, responseUpdateDp } from './redux/modules/common';
import theme from './config/theme';
import { openDoorDpCodes, alarmDpCodes } from './code';
import {
  _getLastOpenRecord,
  _getLastAlarmRecord,
  getAlarmCount,
  getSaveTime,
} from './redux/modules/records';

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const composeLayout = (store, component) => {
  const NavigatorLayoutContainer = connect(_.identity)(component);
  const { dispatch } = store;

  TYEvent.on('deviceDataChange', data => {
    switch (data.type) {
      case 'dpData':
        {
          dispatch(responseUpdateDp(data.payload));
          let isChange = false;
          let alarmChange = false;
          _.forEach(data, (val, key) => {
            if (openDoorDpCodes.indexOf(key) > -1 && !isChange) {
              isChange = true;
              setTimeout(() => {
                dispatch(_getLastOpenRecord(openDoorDpCodes));
              }, 500);
            }
            if (alarmDpCodes.indexOf(key) > -1 && !alarmChange) {
              alarmChange = true;
              setTimeout(() => {
                dispatch(getAlarmCount());
                dispatch(_getLastAlarmRecord(alarmDpCodes));
              }, 500);
            }
          });
        }
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
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo().then(data => {
          dispatch(devInfoChange(data));
          dispatch(getSaveTime());
          dispatch(getAlarmCount());
          dispatch(_getLastOpenRecord(openDoorDpCodes));
          dispatch(_getLastAlarmRecord(alarmDpCodes));
        });
        // eslint-disable-next-line
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then(data => dispatch(devInfoChange(data)));
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

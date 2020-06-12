import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme } from 'tuya-panel-kit';
import { devInfoChange, deviceChange, responseUpdateDp } from './redux/modules/common';
import Connect from './components/publicComponents/connect';
import theme from './config/theme';

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const composeLayout = (store, component) => {
  const NavigatorLayoutContainer = connect(_.identity)(component);
  const { dispatch } = store;

  // TYEvent.on('deviceDataChanged', data => {
  //   dispatch(deviceChange(data));
  // });
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
  // TYEvent.on('dpDataChange', data => {
  //   dispatch(responseUpdateDp(data));
  // });

  // TYEvent.on('deviceOnline', data => {
  //   dispatch(deviceChange({ deviceOnline: data.online }));
  // });

  // eslint-disable-next-line
  // TYEvent.on('appOnline', data => {
  //   dispatch(deviceChange({ appOnline: data.online }));
  // });

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
        TYDevice.getDeviceInfo().then(data => dispatch(devInfoChange(data)));
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
          <Connect mapStateToProps={_.identity}>
            {({ mapStateToProps, ...props }) => {
              const hasInit = Object.keys(props.dpState).length > 0;
              return hasInit ? (
                <Theme theme={_.merge({}, theme, props.theme)}>
                  <NavigatorLayoutContainer dispatch={dispatch} {...props} />
                </Theme>
              ) : null;
            }}
          </Connect>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;

import _ from 'lodash';
import PropTypes from 'prop-types';
import { Store } from 'redux';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme } from 'tuya-panel-kit';
import { devInfoChange, deviceChange, responseUpdateDp } from './redux/modules/common';
import Connect from './components/connect';
import { getDpName } from './redux/modules/cloudState';

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const composeLayout = (store: Store, component: any) => {
  const ThemeContainer = connect((props: { theme: any }) => ({ theme: props.theme }))(Theme);
  const NavigatorLayoutContainer = component;
  const { dispatch } = store;

  TYEvent.on('deviceDataChange', (data: any) => {
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
  TYEvent.on('networkStateChange', (data: any) => {
    dispatch(deviceChange(data));
  });

  class PanelComponent extends Component {
    static propTypes = {
      // eslint-disable-next-line
      devInfo: PropTypes.object.isRequired,
    };

    constructor(props: any) {
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

    getCodesFromSchema(schema: any, regex: any) {
      const switches = _.filter(schema || {}, (v, key) => regex.test(key));
      const switchCodes = switches.map(dp => dp.code);
      return switchCodes;
    }

    _handleDevInfoInit = (data: any) => {
      const codes = this.getCodesFromSchema(data.schema, /^switch_[\d]+$/);
      dispatch(devInfoChange(data));
      dispatch(getDpName(codes));
    };

    render() {
      return (
        <Provider store={store}>
          <ThemeContainer>
            <Connect mapStateToProps={_.identity}>
              {({ mapStateToProps, ...props }: { mapStateToProps: any; [prop: string]: any }) => {
                const hasInit = Object.keys(props.dpState).length > 0;
                return hasInit ? <NavigatorLayoutContainer dispatch={dispatch} {...props} /> : null;
              }}
            </Connect>
          </ThemeContainer>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;

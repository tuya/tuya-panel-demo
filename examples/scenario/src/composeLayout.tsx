import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { TYSdk, Theme } from 'tuya-panel-kit';
import { devInfoChange, deviceChange, responseUpdateDp } from './redux/modules/common';
import Connect from './components/connect';

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const composeLayout = (store: any, component: any) => {
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

  TYEvent.on('networkStateChange', (data: any) => {
    dispatch(deviceChange(data));
  });

  interface PanelComponentProps {
    devInfo: any;
    preload: any;
  }

  class PanelComponent extends Component<PanelComponentProps> {
    static propTypes = {
      // eslint-disable-next-line
      devInfo: PropTypes.object.isRequired,
    };

    constructor(props: PanelComponentProps) {
      super(props);
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo().then((data: any) => dispatch(devInfoChange(data)));
        // eslint-disable-next-line
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then((data: any) => dispatch(devInfoChange(data)));
      }
    }

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

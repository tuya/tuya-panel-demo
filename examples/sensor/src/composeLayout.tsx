import _ from "lodash";
import PropTypes from "prop-types";
import { Store } from "redux";
import React, { Component } from "react";
import { Provider, connect } from "react-redux";
// 如果使用了 elements，Theme 组件需要从 elements 中引用
import { TYSdk } from "tuya-panel-kit";
import Theme from "./components/theme";
import {
  devInfoChange,
  deviceChange,
  responseUpdateDp
} from "./redux/modules/common";
import Connect from "./components/connect";

const TYDevice = TYSdk.device;
const TYEvent = TYSdk.event;

const composeLayout = (store: Store, component: any) => {
  const ThemeContainer = connect((props: { theme: any }) => ({
    theme: props.theme
  }))(Theme);
  const NavigatorLayoutContainer = component;
  const { dispatch } = store;

  TYEvent.on("networkStateChange", data => {
    dispatch(deviceChange(data));
  });

  TYEvent.on("deviceDataChange", data => {
    switch (data.type) {
      case "dpData":
        dispatch(responseUpdateDp(data.payload));
        break;
      default:
        dispatch(deviceChange(data.payload));
        break;
    }
  });

  class PanelComponent extends Component {
    static propTypes = {
      // eslint-disable-next-line
      devInfo: PropTypes.object.isRequired
    };

    constructor(props: any) {
      super(props);
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo().then((data: any) =>
          dispatch(devInfoChange(data))
        );
        // eslint-disable-next-line
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then((data: any) =>
          dispatch(devInfoChange(data))
        );
      }
    }

    render() {
      return (
        <Provider store={store}>
          <ThemeContainer>
            <Connect mapStateToProps={_.identity}>
              {({
                mapStateToProps,
                ...props
              }: {
                mapStateToProps: any;
                [prop: string]: any;
              }) => {
                const hasInit = Object.keys(props.dpState).length > 0;
                return hasInit ? (
                  <NavigatorLayoutContainer dispatch={dispatch} {...props} />
                ) : null;
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

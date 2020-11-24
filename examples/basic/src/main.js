import _ from 'lodash';
import React from 'react';
import { StatusBar } from 'react-native';
import { TYSdk, NavigatorLayout } from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import configureStore from './redux/configureStore';
import Home from './containers/Home';
import { formatUiConfig } from './utils';

console.disableYellowBox = true;

export const store = configureStore();

class MainLayout extends NavigatorLayout {
  constructor(props) {
    super(props);
    if (__DEV__) {
      console.log('TYSdk :', TYSdk);
    }
  }

  /**
   *
   * @desc
   * hookRoute 可以在这里针对特定路由做一些控制处理
   *
   * @param {Object} route
   * @return {Object} - 提供给当前页面组件父容器布局的一些控制值
   * {
   * style: ViewPropTypes.style, // 容器样式，可在此调整背景颜色
   * background: backgroundImage | linearGradientBackground, // 面板图片背景或渐变背景，渐变格式可参考LinearGradient和RadialGradient组件
   * topbarStyle: ViewPropTypes.style, // TopBar 样式，可在调整TopBar背景色
   * topbarTextStyle: Text.propTypes.style, // TopBar的文字样式
   * renderTopBar: () => {}, // 自定义渲染TopBar
   * hideTopbar: true | false,   // 控制是否隐藏 TopBar
   * renderStatusBar: () => {}, // 自定义渲染StatusBar，IOS only
   * showOfflineView: true | false, // 控制是否渲染 OfflineView
   * OfflineView: ReactComponent, // 自定义的 OfflineView 组件
   * }
   */
  // eslint-disable-next-line
  hookRoute(route) {
    // switch (route.id) {
    //   case 'main':
    //     // eslint-disable-next-line
    //     route.background = background;
    //     break;

    //   default:
    //     break;
    // }

    return {
      renderStatusBar: () => <StatusBar barStyle="default" />,
    };
  }

  /**
   * @desc
   * 在此可以通过route中的id来判断使用哪个页面组件，
   * 此外如果有额外的props需要传递给页面组件的，可以在此进行传递。
   *
   * @param {Object} route - route对象
   * @param {object} navigator - Navigator对象，具体使用方法可参考https://facebook.github.io/react-native/docs/0.43/navigator.html
   */
  renderScene(route, navigator) {
    let component;
    let schema = {};
    let uiConfig = {};
    const { dispatch, devInfo, dpState, logs } = this.props;

    if (!_.isEmpty(devInfo)) {
      schema = devInfo.schema || {};
      uiConfig = formatUiConfig(devInfo);
    }

    switch (route.id) {
      case 'main':
        component = (
          <Home
            dpData={{ state: dpState, schema, uiConfig }}
            dispatch={dispatch}
            navigator={navigator}
            logs={logs}
          />
        );
        break;

      default:
        break;
    }

    return component;
  }
}

export default composeLayout(store, MainLayout);

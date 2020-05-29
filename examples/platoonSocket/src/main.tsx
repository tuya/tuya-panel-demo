import _ from 'lodash';
import React from 'react';
import { StatusBar } from 'react-native';
import { TYSdk, NavigatorLayout } from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import configureStore from './redux/configureStore';
import Home from './containers/home';
import Countdown from './containers/countdown';
import Schedule from './containers/schedule';
import Setting from './containers/setting';

console.disableYellowBox = true;

export const store = configureStore({});

class MainLayout extends NavigatorLayout {
  /**
   * @desc
   *   hookRoute 可以做一些控制处理，
   *   return 是一个 Object, 返回出去的Object将会被 FullView 所应用，
   *   FullView 即一个视图包裹组件，内置了头部栏，背景，离线提示，模态窗等功能，
   *   因此你可以通过return的object来自定义这些内容;
   * @param {Object} route - 路径对象，里面会包括路径id等路径信息，也会包含navigator.push()所附带的值
   * @example
   * {
   *   background: backgroundImage | linearGradientBackground, // 背景（可支持图片或渐变）
   *   backgroundColor: '#FCFCFC', // 背景颜色值
   *   style: ViewPropTypes.style,
   *   topbarStyle: ViewPropTypes.style, // 控制头部栏的样式
   *   topbarTextStyle: Text.propTypes.style, // 控制头部栏的文字样式
   *   hideFullView: true | false, // 控制是否隐藏 FullView
   *   showOfflineView: true | false, // 是否渲染 OfflineView
   *   renderFullView: (props) => {
   *     return (<FullView />);
   *   },
   *   FullView: ReactComponent, // 自定义的 FullView 组件, 如果使用自定义 FullView 组件，TopBar、OfflineView 也需要在 FullView 里面调用
   *   hideTopbar: true | false, // 控制是否隐藏 TopBar
   *   OfflineView: ReactComponent, // 自定义的 OfflineView 组件
   * }
   */
  hookRoute(route: any) {
    const { theme } = this.props;
    //   switch (route.id) {
    //     case 'main':
    //       // eslint-disable-next-line
    //       route.background = background;
    //       break;

    //     default:
    //       break;
    //   }

    return {
      // showOfflineView: false,
      ...route,
      style: { backgroundColor: theme.global.brand },
      renderStatusBar: () => <StatusBar barStyle="default" />,
    };
  }

  /**
   * @desc 渲染指定的页面组件
   * @param {Object} route - 路径对象信息
   * @param {Object} navigator - Navigator对象，api check here https://facebook.github.io/react-native/docs/0.43/navigator.html#methods
   */
  renderScene(route: any, navigator: any) {
    let component;
    let schema = {};
    let uiConfig = {};
    const { dispatch, devInfo, dpState, logs } = this.props;

    if (!_.isEmpty(devInfo)) {
      schema = devInfo.schema || {};
      uiConfig = devInfo.uiConfig || {};
    }

    if (!!uiConfig && _.isEmpty(uiConfig)) {
      uiConfig = TYSdk.uiConfig || {};
    }

    if (route.element) {
      const H5WebView = route.element;
      return <H5WebView navigator={navigator} {...route} />;
    }

    switch (route.id) {
      case 'main':
        component = (
          <Home
            dpData={{ state: dpState, schema, uiConfig }}
            dispatch={dispatch}
            navigator={navigator}
            logs={logs}
            {...route}
          />
        );
        break;
      case 'schedule':
        component = <Schedule {...route} />;
        break;
      case 'countdown':
        component = <Countdown {...route} />;
        break;
      case 'setting':
        component = <Setting {...route} />;
        break;
      default:
        break;
    }

    return component;
  }
}

export default composeLayout(store, MainLayout);

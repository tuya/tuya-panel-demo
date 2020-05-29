import _ from 'lodash';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigatorLayout } from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import configureStore from './redux/configureStore';
import Home from './containers/Home';
import Power from './containers/power';
import { defaultBackground } from './config/boxConfig';

console.disableYellowBox = true;

const store = configureStore({});

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
    switch (route.id) {
      case 'main':
        // eslint-disable-next-line
        route.background = defaultBackground;
        route.topbarStyle = {
          backgroundColor: 'transparent',
        };
        break;
      case 'power':
        route.style = {
          backgroundColor: '#291D1D',
        };
        break;
      default:
        break;
    }
    return {
      hideTopbar: route.id === 'power',
      topbarTextStyle: { color: '#fff' },
      showOfflineView: true,
      ...route,
      renderStatusBar: () => <StatusBar barStyle="light-content" />,
    };
  }

  /**
   * @desc 渲染指定的页面组件
   * @param {Object} route - 路径对象信息
   * @param {Object} navigator - Navigator对象，api check here https://facebook.github.io/react-native/docs/0.43/navigator.html#methods
   */
  renderScene(route: any, navigator: any) {
    let component;
    switch (route.id) {
      case 'main':
        component = <Home navigator={navigator} />;
        break;
      case 'power':
        component = <Power navigator={navigator} route={route} />;
        break;
      default:
        break;
    }
    return component;
  }
}

export default composeLayout(store, MainLayout);

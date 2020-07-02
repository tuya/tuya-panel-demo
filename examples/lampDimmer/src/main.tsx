import React from 'react';
import { View, StatusBar } from 'react-native';
import { NavigatorLayout } from 'tuya-panel-kit';
import configureStore from './redux/configureStore';
import composeLayout from './composeLayout';
import HomeScene from './containers/home';
import DimmerView from './containers/Dimmer';
import SettingsView from './containers/settings';
import SettingView from './containers/Setting';

// console.disableYellowBox = true;

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
}
const Store = configureStore({});

class MainLayout extends NavigatorLayout {
  /*
  hookRoute 可以做一些控制处理
  return 是一个 Object,
  {
    background: backgroundImage | linearGradientBackground,
    style: ViewPropTypes.style,
    // topbarStyle: ViewPropTypes.style, // 需要 Android TopBar 组件支持设置 style
    hideFullView: true | false,   // 控制是否隐藏 FullView
    FullView: ReactComponent,     // 自定义的 FullView 组件, 如果使用自定义 FullView 组件，TopBar、OfflineView 也需要在 FullView 里面调用
    hideTopbar: true | false,   // 控制是否隐藏 TopBar
    OfflineView: ReactComponent, // 自定义的 OfflineView 组件
    showOfflineView: true | false, // 是否渲染 OfflineView
  }
  */
  hookRoute(route: any) {
    return {
      noFullView: false,
      ...route,
      showOfflineView: true,
      hideTopbar: route.id !== 'timer' && route.id !== 'addTimer' ? false : true,
      renderStatusBar: () => <StatusBar barStyle="light-content" />,
    };
  }

  renderScene(route: any, navigator: any) {
    if (route.element) {
      const H5WebView = route.element;
      return <H5WebView navigator={navigator} {...route} />;
    }

    let { Element = View } = route;
    switch (route.id) {
      case 'main':
        Element = HomeScene;
        break;
      case 'dimmer':
        Element = DimmerView;
        break;
      case 'settings':
        Element = SettingsView;
        break;
      case 'setting':
        Element = SettingView;
        break;
      default:
        Element = View;
    }
    return <Element {...route} navigator={navigator} />;
  }
}

export default composeLayout(Store, MainLayout);

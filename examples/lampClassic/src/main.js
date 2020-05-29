import React from 'react';
import { View, StatusBar } from 'react-native';
import { NavigatorLayout } from 'tuya-panel-kit';
import initState from './redux/initState';
import configureStore from './redux/configureStore';
import composeLayout from './composeLayout';

import Home from './containers/home';

console.disableYellowBox = true;

if (!__DEV__) {
  console.log = () => {};
}

export const Store = configureStore(initState);

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
  hookRoute(route) {
    return {
      ...route,
      showOfflineView: true,
      renderStatusBar: () => <StatusBar barStyle="light-content" />,
    };
  }

  renderScene(route, navigator) {
    const routeProps = {
      ...route,
    };
    let { Element = View } = routeProps;
    switch (route.id) {
      case 'main':
        Element = Home;
        break;
      default:
        Element = View;
    }

    return <Element navigator={navigator} {...routeProps} />;
  }
}

export default composeLayout(Store, MainLayout);

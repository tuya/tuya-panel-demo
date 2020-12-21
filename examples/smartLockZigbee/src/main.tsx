import React from 'react';
import { StatusBar } from 'react-native';
import { Dispatch } from 'redux';
import {
  TYSdk,
  NavigatorLayout,
  NavigationOptions,
  DeprecatedNavigator,
  DeprecatedNavigatorRoute,
} from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import { store, ReduxState } from './models';
import Home from './pages/home';
import Setting from './pages/setting';
import AlarmList from './pages/alarmList';
import OpenList from './pages/openList';

console.disableYellowBox = true;

type Props = ReduxState & { dispatch: Dispatch };

// 慎用，生成环境上不要开启，console 打印层次过深会导致性能问题
// if (__DEV__) {
//   console.log('TYSdk :', TYSdk);
// }

class MainLayout extends NavigatorLayout<Props> {
  /**
   *
   * @desc hookRoute 可以在这里针对特定路由做一些控制处理
   */
  hookRoute(route: DeprecatedNavigatorRoute): NavigationOptions {
    const routeProps: NavigationOptions = {};
    console.log(route);
    switch (route.id) {
      case 'main':
        break;
      case 'setting':
        routeProps.title = 'Setting';
        routeProps.background = {
          '3%': '#f82232',
          '90%': '#FF624C',
        };
        break;
      default:
        break;
    }

    return {
      ...routeProps,
      hideTopbar: route.id === 'main' ? false : true,
      renderStatusBar: () => <StatusBar barStyle="default" />,
    };
  }

  /**
   * @desc
   * 在此可以通过route中的id来判断使用哪个页面组件，
   * 此外如果有额外的props需要传递给页面组件的，可以在此进行传递。
   *
   * @param {Object} route - route对象
   * @param {object} navigator - Navigator对象，具体使用方法可参考 https://facebook.github.io/react-native/docs/0.43/navigator.html
   */
  renderScene(route: DeprecatedNavigatorRoute, navigator: DeprecatedNavigator) {
    let component;
    switch (route.id) {
      case 'main':
        component = <Home />;
        break;
      case 'setting':
        component = <Setting {...navigator} />;
        break;
      case 'alarmList':
        component = <AlarmList />;
        break;
      case 'openList':
        component = <OpenList />;
        break;
      default:
        break;
    }

    return component;
  }
}

export default composeLayout(store, MainLayout);

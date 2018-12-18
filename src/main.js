import _ from 'lodash';
import React from 'react';
import {
  StyleSheet,
} from 'react-native';
import { TYSdk, NavigatorLayout, TopBar } from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import configureStore from './redux/configureStore';
import Home from './containers/Home';
import { formatUiConfig } from './utils';

export const store = configureStore();

const linearGradientBackground = {
  '3%': '#FF7E38',
  '90%': '#FF624C',
};

class MainLayout extends NavigatorLayout {
  constructor(props) {
    super(props);
    console.log('TYSdk :', TYSdk);
  }
  /*
  hookRoute 可以做一些控制处理
  return 是一个 Object,
  {
    background: backgroundImage | linearGradientBackground,
    backgroundColor: '#FCFCFC', // 颜色值
    style: ViewPropTypes.style,
    // topbarStyle: ViewPropTypes.style, // 需要 Android TopBar 组件支持设置 style
    hideFullView: true | false,   // 控制是否隐藏 FullView
    renderFullView: (props) => {
      return (
        <FullView>
        </FullView>
      );
    },
    FullView: ReactComponent,     // 自定义的 FullView 组件, 如果使用自定义 FullView 组件，TopBar、OfflineView 也需要在 FullView 里面调用
    hideTopbar: true | false,   // 控制是否隐藏 TopBar
    OfflineView: ReactComponent, // 自定义的 OfflineView 组件
    showOfflineView: true | false, // 是否渲染 OfflineView
  }
  */
  // eslint-disable-next-line
  hookRoute(route) {
  //   switch (route.id) {
  //     case 'main':
  //       // eslint-disable-next-line
  //       route.background = background;
  //       break;

  //     default:
  //       break;
  //   }

    return {
      background: linearGradientBackground,
      style: styles.fullview,
    };
  }

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
        component =
          <Home
            dpData={{ state: dpState, schema, uiConfig }}
            dispatch={dispatch}
            navigator={navigator}
            logs={logs}
          />;
        break;

      default:
        break;
    }

    return component;
  }
}

const styles = StyleSheet.create({
  fullview: {
    // backgroundColor: 'red',
  },
});

export default composeLayout(store, MainLayout);

import React from 'react';
import { View, StatusBar } from 'react-native';
import _ from 'lodash';
import { NavigatorLayout, TopBar, TYSdk } from 'tuya-panel-kit';
import configureStore from './redux/configureStore';
import composeLayout from './composeLayout';
import { getRoute } from './config/router';

if (!__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.log = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.warn = () => {};
}

const Store = configureStore({});

class MainLayout extends NavigatorLayout {
  get topBarMoreIconName() {
    return 'moreH';
  }

  _handleTabChange = (tab: string) => {
    const _navigator = TYSdk.Navigator;
    if (tab === 'right') {
      TYSdk.native.showDeviceMenu();
    } else if (_navigator && _navigator.getCurrentRoutes().length > 1) {
      _navigator.pop();
    } else {
      TYSdk.native.back();
    }
  };

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
    const routeProps = {
      ...route,
      ...getRoute(route.id),
    };

    return {
      ...routeProps,
      showOfflineView: true,
      renderTopBar: () => {
        const uiPhase = _.get(this, 'props.devInfo.uiPhase') || 'release';
        const actions = [
          {
            accessibilityLabel: 'TopBar_Btn_RightItem',
            name: this.topBarMoreIconName,
            onPress: () => this._handleTabChange('right'),
          },
          uiPhase !== 'release' && {
            accessibilityLabel: 'TopBar_Preview',
            style: {
              backgroundColor: '#57DD43',
              borderWidth: 1,
            },
            contentStyle: { fontSize: 12 },
            color: '#000',
            source: 'Preview',
            disabled: true,
          },
        ].filter(v => !!v);
        return (
          <TopBar
            title={routeProps.title || ''}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            actions={actions}
            onBack={() => this._handleTabChange('left')}
          />
        );
      },
      renderStatusBar: () => <StatusBar barStyle="default" />,
    };
  }

  renderScene(route: { id: any }, navigator: any) {
    const routeProps = {
      ...route,
      ...getRoute(route.id),
    };
    const { Element = View } = routeProps;

    return <Element navigator={navigator} {...routeProps} />;
  }
}

export default composeLayout(Store, MainLayout);

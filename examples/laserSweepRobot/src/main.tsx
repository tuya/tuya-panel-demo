/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { StatusBar } from 'react-native';
import _ from 'lodash';
import { observer, inject } from 'mobx-react';
import { createNavigator } from 'tuya-panel-kit';
import router from './config/router';
import composeLayout from './composeLayout';
import store from './store';

if (!__DEV__) {
  global.console = {
    info: () => { },
    log: () => { },
    warn: () => { },
    debug: () => { },
    error: () => { },
  };
}

console.disableYellowBox = true;

const routerMap = _.keyBy(router, 'id');
const Navigator = createNavigator({ router });
@inject((state: any) => {
  const { devInfo, theme } = state;
  const { name: devName } = devInfo.data;
  return {
    devName,
    theme: theme.getData,
  };
})
@observer
class MainLayout extends Navigator {
  // eslint-disable-next-line
  hookRoute(route) {
    return {
      id: route.id,
      title: route.title,
      background: '#D1D1D1',
      hideTopbar: route.hideTopbar || false,
      showOfflineView: false,
      topbarStyle: {
        backgroundColor: 'transparent',
      },
      renderStatusBar: () => <StatusBar barStyle="default" />,
    };
  }
}

export default composeLayout(store, MainLayout);

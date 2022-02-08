import React from 'react';
import { StatusBar } from 'react-native';
import _ from 'lodash';
import { createNavigator, GlobalTheme, NavigationRoute } from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import configureStore from './models/configureStore';
import MainLayout from './pages';
import FamilyPage from './pages/family';
import Set from './pages/set';

console.disableYellowBox = true;
console.ignoredYellowBox = ['Require cycle:', 'Module TYRCT'];

const store = configureStore({});

const options = {
  showOfflineView: false,
  noFullView: false,
  hideTopbar: false,
  topbarStyle: { backgroundColor: '#fff' },
  topbarTextStyle: { color: '#000' },
  renderStatusBar: () => <StatusBar barStyle="default" />,
};

const hideTopBarRoute = {
  showOfflineView: false,
  noFullView: false,
  hideTopbar: true,
  renderStatusBar: () => <StatusBar barStyle="default" />,
};

export const routes: NavigationRoute[] = [
  {
    name: 'main',
    component: MainLayout,
    options: {
      ...hideTopBarRoute,
    },
  },
  {
    name: 'family',
    component: FamilyPage,
    options: {
      ...hideTopBarRoute,
    },
  },
  {
    name: 'set',
    component: Set,
    options,
  },
];

interface Props {
  theme: GlobalTheme;
}

const Navigator = createNavigator<Props>({
  router: routes,
});

export default composeLayout(store, Navigator);

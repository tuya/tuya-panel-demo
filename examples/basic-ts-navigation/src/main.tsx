import React from 'react';
import { createNavigator, GlobalTheme, NavigationRoute, TransitionPresets } from 'tuya-panel-kit';
import { StatusBar } from 'react-native';
import composeLayout from './composeLayout';
import { store } from './models';
import Home from './pages';
import Page1 from './pages/home/page1';
import Page2 from './pages/home/page2';
import Page3 from './pages/home/page3';

console.disableYellowBox = true;

const router: NavigationRoute[] = [
  {
    name: 'main',
    component: Home,
    options: {
      title: 'Home',
      renderStatusBar: () => <StatusBar barStyle="default" />,
    },
  },
  {
    name: 'page1',
    component: Page1,
    options: {
      title: 'First Page',
      ...TransitionPresets.ModalPresentationIOS,
      renderStatusBar: () => <StatusBar barStyle="default" />,
    },
  },
  {
    name: 'page2',
    component: Page2,
    options: {
      title: 'Scond Page',
      ...TransitionPresets.SlideFromRightWithMargin,
      renderStatusBar: () => <StatusBar barStyle="default" />,
    },
  },
  {
    name: 'page3',
    component: Page3,
    options: {
      gesture: true,
      hideTopbar: false,
      title: 'Third Page',
      renderStatusBar: () => <StatusBar barStyle="default" />,
    },
  },
];

interface Props {
  theme: GlobalTheme;
}

const Navigator = createNavigator<Props>({
  router,
  screenOptions: {},
});

export default composeLayout(store, Navigator);

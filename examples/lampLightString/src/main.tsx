import { Dispatch } from 'redux';
import { NavigationRoute, createNavigator, TransitionPresets } from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import { ReduxState } from './models';
import Home from './pages/home';
import CloudTimer from './pages/cloudTimer';
import CloudTimerDimmer from './pages/cloudTimer/Dimmer';
import CloudTimerScene from './pages/cloudTimer/Scene';
import Countdown from './pages/countDown';
import ExecutionCycle from './pages/executionCycle';
import configureStore from '@models/configureStore';

console.disableYellowBox = true;
export const store = configureStore({});

type Props = ReduxState & { dispatch: Dispatch };

const customRouteOptions = {
  ...TransitionPresets.ModalPresentationDarkThemeIOS,
  cardOverlayEnabled: true,
  cardStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  hideTopbar: true,
};

const commonRouteOptions = {
  title: '',
  hideTopbar: true,
};

const router: NavigationRoute[] = [
  {
    name: 'main',
    component: Home,
    options: {
      ...commonRouteOptions,
    },
  },
  {
    name: 'cloudTimer',
    component: CloudTimer,
    options: {
      ...customRouteOptions,
      hideTopbar: true,
    },
  },
  {
    name: 'cloudTimerDimmer',
    component: CloudTimerDimmer,
    options: {
      ...TransitionPresets.SlideFromRightWithMargin,
      hideTopbar: true,
    },
  },
  {
    name: 'cloudTimerScene',
    component: CloudTimerScene,
    options: {
      ...TransitionPresets.SlideFromRightWithMargin,
      hideTopbar: true,
    },
  },
  {
    name: 'countDown',
    component: Countdown as React.ComponentType,
    options: customRouteOptions,
  },
  {
    name: 'executeCycle',
    component: ExecutionCycle,
    options: {
      ...TransitionPresets.SlideFromRightWithMargin,
      hideTopbar: true,
    },
  },
];

const Navigator = createNavigator<Props>({
  router,
});

export default composeLayout(store, Navigator);

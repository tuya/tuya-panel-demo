import _ from 'lodash';
import { createNavigator, GlobalTheme, NavigationRoute, TransitionPresets } from 'tuya-panel-kit';
import configureStore from './models/configureStore';
import composeLayout from './composeLayout';
import Home from './pages/home';
import DiyScene from './pages/diyScene';
import Plan from './pages/plan';
import Countdown from './pages/countdown';
import CloudTiming from './pages/cloudTiming';
import LightStripLength from './pages/lightStripLength';

console.disableYellowBox = true;
console.ignoredYellowBox = ['Require cycle:', 'Module TYRCT'];

const store = configureStore({});

const router: NavigationRoute[] = [
  {
    name: 'main',
    component: Home,
    options: {
      hideTopbar: true,
    },
  },
  {
    name: 'diyScene',
    component: DiyScene,
    options: {
      hideTopbar: true,
      ...TransitionPresets.ModalSlideFromBottomIOS,
    },
  },
  {
    name: 'plan',
    component: Plan,
    options: {
      hideTopbar: true,
    },
  },
  {
    name: 'countdown',
    component: Countdown,
    options: {
      hideTopbar: true,
      ...TransitionPresets.ModalSlideFromBottomIOS,
    },
  },
  {
    name: 'light_strip_length',
    component: LightStripLength,
    options: {
      hideTopbar: true,
    },
  },
  {
    name: 'cloudTiming',
    component: CloudTiming,
    options: {
      hideTopbar: true,
      ...TransitionPresets.ModalSlideFromBottomIOS,
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

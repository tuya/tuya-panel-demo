import Home from '../containers/home';
import Scene from '../containers/ScenLayout';

export const router = {
  main: {
    element: Home,
  },
  scene: {
    element: Scene,
    hideTopbar: true,
  },
};

export default {
  router,
};

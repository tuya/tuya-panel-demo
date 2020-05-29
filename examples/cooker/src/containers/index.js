import Config from '../config';
import Home from '../containers/home';

console.disableYellowBox = true;

Config.setRoute({
  main: {
    element: Home,
    hideTopbar: true,
  },
});

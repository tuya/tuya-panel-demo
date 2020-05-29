import Config from '../config';
import HomeScene from '../containers/home';

/* The props give to FullView */
const defRoute = {
  noFullView: false,
  hideTopbar: false,
};

Config.setRoute('main', {
  ...defRoute,
  Element: HomeScene,
});

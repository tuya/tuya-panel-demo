import Home from '../containers/Home';
import Params from '../containers/Params';
import FilterSetting from '../containers/FilterSetting';

/* The props give to FullView */
const defRoute = {
  noFullView: false,
  hideTopbar: false,
};

const config: any = {
  main: {
    ...defRoute,
    Element: Home,
  },
  params: {
    ...defRoute,
    hideTopbar: true,
    Element: Params,
  },
  filter: {
    ...defRoute,
    Element: FilterSetting,
  },
};

export const getRoute = (id: string) => {
  return config[id] || {};
};

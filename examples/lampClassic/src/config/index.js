/* eslint-disable global-require */
import defaultConfig from './default';
import theme from './theme';

export default {
  routes: {},
  setRoute(key, data) {
    this.routes[key] = data;
  },
  getRoute(key) {
    return this.routes[key] || {};
  },
  theme,
  ...defaultConfig,
  defalutScenes: [],
  dpFun: {},
  capabilityFun: {},
};

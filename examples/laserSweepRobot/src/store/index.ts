import DevInfoStore from './devInfo';
import DpStateStore from './dpState';
import CustomConfigStore from './customConfig';
import PanelConfigStore from './panelConfig';
import MapDataStore from './mapData';
import ThemeStore from './theme';

const devInfo = new DevInfoStore();
const dpState = new DpStateStore();
const customConfig = new CustomConfigStore();
const panelConfig = new PanelConfigStore();
const mapDataState = new MapDataStore();
const theme = new ThemeStore();

export default {
  devInfo,
  dpState,
  customConfig,
  panelConfig,
  mapDataState,
  theme,
};

import { Dimensions, Platform } from 'react-native';
import { Utils } from 'tuya-panel-kit';

const {
  convertX: cx,
  convertY: cy,
  convert,
  isIphoneX,
  statusBarHeight,
  topBarHeight,
} = Utils.RatioUtils;
const { width: winWidth, height: winHeight } = Dimensions.get('screen');

const smallScreen = winHeight < 667;

const middlleScreen = winHeight >= 667 && winHeight <= 736;

const isIOS = Platform.OS === 'ios';

// 针对7p做单独处理
const is7Plus = winHeight === 736 && isIOS;

// 全屏播放器宽度
const fullPlayerWidth =
  Platform.OS === 'ios' ? Math.ceil(winHeight) : Math.ceil(winHeight + statusBarHeight);
// 全屏播放器高度
const fullPlayerHeight = Math.ceil(winWidth);

// 普通播放器高度
const normalPlayerWidth = Math.ceil(winWidth);
const normalPlayerHeight = Math.ceil((winWidth * 9) / 16);

export default {
  cx,
  cy,
  convert,
  isIphoneX,
  winWidth,
  winHeight,
  statusBarHeight,
  topBarHeight,
  smallScreen,
  middlleScreen,
  fullPlayerWidth,
  fullPlayerHeight,
  normalPlayerWidth,
  normalPlayerHeight,
  isIOS,
  is7Plus,
};

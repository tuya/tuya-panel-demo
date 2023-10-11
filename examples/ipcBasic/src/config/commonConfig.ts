import { Dimensions, Platform } from 'react-native';

import { Utils } from 'tuya-panel-kit';

const {
  convertX: cx,
  convertY: cy,
  convert,
  isIphoneX,
  statusBarHeight: statusBarHeight2,
  topBarHeight,
} = Utils.RatioUtils;

const { width: winWidth, height: winHeight } = Dimensions.get('screen');

const smallScreen = winHeight < 667;

const middleScreen = winHeight >= 667 && winHeight <= 736;

const isIOS = Platform.OS === 'ios';
// 针对7p做单独处理
const is7Plus = winHeight === 736 && isIOS;

// 全屏播放器宽度
const fullPlayerWidth =
  Platform.OS === 'ios' ? Math.ceil(winHeight) : Math.ceil(winHeight + statusBarHeight2);
// 全屏播放器高度
const fullPlayerHeight = Math.ceil(winWidth);

// 普通播放器高度
const normalPlayerWidth = Math.ceil(winWidth);
const normalPlayerHeight = Math.ceil((winWidth * 9) / 16);

let listHight = Math.ceil(cy(55));
smallScreen && (listHight = Math.ceil(cy(29)));
middleScreen && (listHight = Math.ceil(cy(38)));

export default {
  cx,
  cy,
  convert,
  isIphoneX,
  winWidth,
  winHeight,
  statusBarHeight: statusBarHeight2 + 2,
  topBarHeight,
  smallScreen,
  middleScreen,
  fullPlayerWidth,
  fullPlayerHeight,
  normalPlayerWidth,
  normalPlayerHeight,
  isIOS,
  is7Plus,
  listHight,
};

import { Platform } from 'react-native';
import { defaultTheme, Utils } from 'tuya-panel-kit';

const { deepMerge } = Utils.ThemeUtils;

/**
 * Timer 定时
 */
const timer = {
  fontColor: '#333', // 主要字体色
  titleBg: '#fff', // 头部栏底色
  titleFontColor: '#333', // 头部栏字体颜色
  boardBg: '#f8f8f8', // 整体底色
  cellBg: '#fff', // 列表底色
  cellLine: 'rgba(51, 51, 51, 0.1)', // 列表分隔栏颜色
  subFontColor: 'rgba(51, 51, 51, 0.5)', // 副标题字体颜色
  btnBg: '#fff', // 添加定时按钮底色
  btnBorder: 'rgba(51, 51, 51, 0.2)', // 添加定时按钮边框色
  btnFontColor: 'rgba(51, 51, 51, 0.8)', // 添加定时按钮字体颜色
  repeatColor: '#44DB5E', // 重复的背景颜色
  thumbTintColor: '#fff', // 关闭情况下滑块背景色
  onThumbTintColor: '#fff', // 开启情况下滑块背景色
  onTintColor: '#4CD964', // 开启情况下背景色
  tintColor: '#e5e5e5', // 关闭情况下背景色
  ios_backgroundColor: '#f0f0f0',
  statusBgStyle: 'dark-content', // 状态栏字体颜色
};

const battery = {
  dark: {
    batteryColor: 'rgba(255,255,255,.5)',
  },
  light: {
    batteryColor: 'rgba(0,0,0,.5)',
  },
};

const theme = deepMerge(defaultTheme, {
  timer,
  battery,
});

export default theme;

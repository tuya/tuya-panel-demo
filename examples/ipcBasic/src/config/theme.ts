import commonConfig from './commonConfig';

const { isIOS } = commonConfig;

const list = {
  dark: {
    boardBg: '#222222',
  },
  light: {
    boardBg: '#f8f8f8',
  },
};

const switchButton = {
  dark: {
    width: 55, // 按钮宽度
    height: 28,
    thumbSize: 26, // 滑块宽高尺寸
    margin: 1,
    tintColor: '#e5e5e5', // 关闭情况下背景色
    onTintColor: '#4CD964', // 开启情况下背景色
    thumbTintColor: '#fff', // 关闭情况下滑块背景色
    onThumbTintColor: '#fff', // 开启情况下滑块背景色
  },
  light: {
    width: 55, // 按钮宽度
    height: 28,
    thumbSize: 26, // 滑块宽高尺寸
    margin: 1,
    tintColor: '#e5e5e5', // 关闭情况下背景色
    onTintColor: '#4CD964', // 开启情况下背景色
    thumbTintColor: '#fff', // 关闭情况下滑块背景色
    onThumbTintColor: '#fff', // 开启情况下滑块背景色
  },
};

const popup = {
  basic: {
    titleFontColor: '#9B9B9B',
    titleBg: '#ffffff',
  },
  dark: {
    lineColor: '#404040',
    titleFontColor: '#999999',
    titleBg: '#262626',
  },
  light: {
    titleFontColor: '#9B9B9B',
    titleBg: '#ffffff',
  },
};

const customTheme = {
  dark: {
    barStyleBg: isIOS ? 'light-content' : 'light-content',
    background: '#181818',
    contentBgc: '#222222',
    commonTextColor: '#ffffff',
    textColor: '#ffffff',
    // 基础模块Img颜色
    basicTintColor: '#ffffff',
    // grid菜单
    featureHoverBgc: '#383838',
    featureNormalTintColor: '#bdbdbd',
    // dialog颜色
    dialogBgc: '#262626',
    dialogDivideLine: '#404040',
    dialogTitleColor: '#999999',
    // 非预览界面背景色
    notLiveBackground: '#181818',
    statusBackground: '#181818',
  },
  light: {
    barStyleBg: isIOS ? 'dark-content' : 'light-content',
    background: '#ffffff',
    contentBgc: '#f5f5f5',
    commonTextColor: '#333333',
    textColor: '#000000',
    // 基础模块Img颜色
    basicTintColor: '#333333',
    featureHoverBgc: '#e5e5e5',
    featureNormalTintColor: '#333333',
    // dialog颜色
    dialogBgc: '#ffffff',
    dialogDivideLine: '#eeeeee',
    dialogTitleColor: '#9B9B9B',
    // 非预览界面背景色
    notLiveBackground: '#f5f5f5',
    statusBackground: '#000000',
  },
};

export default {
  type: 'dark',
  list,
  switchButton,
  popup,
  customTheme,
};

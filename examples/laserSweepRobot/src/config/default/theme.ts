export default {
  type: 'light',
  global: {
    brand: '#0065FF', // 品牌色（主题色）
    bgColor: '#f8f8f8', // 背景色
    fontSizeBase: 1, // 字体基准比例
    dividerColor: '#e5e5e5', // 分隔线颜色
    success: '#68DAD3', // 成功颜色
    warning: '#F5BF61', // 警告颜色
    error: '#F49A6D', // 失败
    mask: 'rgba(0, 0, 0, 0.7)', // 遮罩颜色
    text: {
      light: '#333', // 字体在 light 下的颜色
      dark: '#fff', // 字体在 dark 下的颜色
    },
  },
  slider: {
    light: {
      trackRadius: 2, // 滑块圆角
      trackHeight: 4, // 滑块高度
      minimumTrackTintColor: '#68DAD3', // 最小值颜色
      maximumTrackTintColor: 'rgba(104, 218, 211, 0.3)', // 最大值颜色
      thumbSize: 24, // 滑块圆的尺寸（TODO: 是否被宽高替代）
      thumbRadius: 14, // 滑块圆的圆角
      thumbTintColor: '#fff', // 滑块的颜色
    },
  },
  list: {
    light: {},
  },
  /**
   * TopBar 头部栏变量
   */
  topbar: {
    background: 'rgba(255, 255, 255, 0)', // 头部栏背景色
    color: '#000', // 头部栏字体颜色（包括图标色）
  },
};

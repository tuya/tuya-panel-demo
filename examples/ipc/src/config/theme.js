const switchButton = {
  yellow: {
    width: 55, // 按钮宽度
    height: 28,
    thumbSize: 26, // 滑块宽高尺寸
    margin: 1,
    tintColor: 'red', // 关闭情况下背景色
    onTintColor: 'red', // 开启情况下背景色
    thumbTintColor: 'red', // 关闭情况下滑块背景色
    onThumbTintColor: 'red', // 开启情况下滑块背景色
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
export default {
  type: 'light',
  switchButton,
};

import { LayoutAnimation, StyleSheet } from 'react-native';
import { cx } from './constant';

// 大型图片
export const images = {
  background: require('../res/bg.jpg'),
};
// 图标
export const icons = {
  arrow: require('../res/tuya_goto_icon.png'),
};
// LayoutAnimation动画
export const animation = {
  scaleXY: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.linear,
      property: LayoutAnimation.Properties.scaleXY,
    },
    update: {
      type: LayoutAnimation.Types.linear,
      springDamping: 0.6,
      duration: 100,
      initialVelocity: 2,
    },
  },

  easeInOut: {
    duration: 280,
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      duration: 280,
    },
  },
};
// 基础布局
export const layout = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: cx(18),
    paddingRight: cx(16),
    height: cx(48),
    backgroundColor: '#fff',
  },

  rowIcon: {
    width: cx(18),
    height: cx(18),
    resizeMode: 'contain',
    marginRight: cx(11),
  },

  rowTitle: {
    fontSize: cx(14),
    color: '#666666',
    backgroundColor: 'transparent',
  },

  tabSelectedTitle: {
    fontSize: cx(16),
    color: '#32AD3C',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },

  tabTitle: {
    fontSize: cx(16),
    color: '#fff',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
});

export default {
  images,
  icons,
  layout,
  animation,
};

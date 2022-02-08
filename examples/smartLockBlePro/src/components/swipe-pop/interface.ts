/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StyleProp, ViewStyle } from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { height: IHeight } = Utils.RatioUtils;
const { color } = Utils.ColorUtils;

export type Section = {
  key: string | number;
  height: number;
  position?: number;
};

export const winHeight = IHeight;
export const defaultSections = [{ key: 'full', height: IHeight }];

export const IDefaultProps = {
  showHeight: 0, // 显示高度
  sections: defaultSections as Section[], // 显示阶段，即上滑时分几个阶段显示
  lastArrowOffset: 0, // 最后箭头相对顶部的偏移量，当为全屏弹窗是可针对刘海屏做相应的处理
  arrowColor: color.hex2RgbString('#000', 0.1), // 窗口收起时，箭头的颜色
  arrowTintColor: '#fff', // 窗口展开时，箭头的颜色
  activeKey: 'none', // 当前窗口位置, 默认为收起
  showMask: true, // 显示mask
  maskColor: 'rgba(0,0,0,0.7)',
  contentType: 'normal' as 'normal' | 'full', // 内容显示范围设备，normal 表示内容显示区为箭头下方区域， full 表示内容显示区为整个窗口
  startValidHeight: 10, // 滑动起作用距离
  disabled: false, // 是否禁用
  onKeyChange(key: string | number) {}, // 当窗口发生变化时调用
  onSwiping(arg: { scrollTop?: number; maxTop?: number } = {}) {},
};

export type ISwipePopProps = {
  wrapperStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  maskStyle?: StyleProp<ViewStyle>;
} & Partial<typeof IDefaultProps>;

export type ISwipePopState = {
  activeKey: string | number;
};

export const defaultArrowProps = {
  color: color.hex2RgbString('#000', 0.1),
  tintColor: '#fff',
  deep: 0,
};

export type IArrowProps = {
  deep?: number; // 0 - 1
} & Partial<typeof defaultArrowProps>;

export interface IArrowState {
  deep: number;
}

import { LayoutRectangle } from 'react-native';

/** 渐变方向: 0: →, 1: ←, 2: ↑, 3: ↓ */
export enum GradientDir {
  right,
  left,
  up,
  down,
}

export interface UIDataPropType {
  index: number;
  width: number;
  height: number;
  pos: number[];
}

export interface UIRefPropType {
  layout?: LayoutRectangle;
  UIData: UIDataPropType[];
}

export interface LightsUIProps {
  innerRef?: React.Ref<UIRefPropType>;
  lights: [];
  onSetRef?: any;
  theme?: any;
}

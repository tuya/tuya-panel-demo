import { LayoutRectangle } from 'react-native';

/** 渐变方向: 0: →, 1: ←, 2: ↑, 3: ↓ */
export enum GradientDir {
  right,
  left,
  up,
  down,
}

export interface UIDataPropType {
  width: number;
  height: number;
  pos: [number, number];
  gradientDir: GradientDir;
  imgKey: string;
}

export interface UIRefPropType {
  layout?: LayoutRectangle;
  UIData: UIDataPropType[];
}

export interface LightsUIProps {
  innerRef?: React.Ref<UIRefPropType>;
}

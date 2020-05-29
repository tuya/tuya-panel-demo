interface DpState {
  switch: boolean;
  switch_cooking: boolean;
  mode: string;
  cook_mode: string;
  front_warm: string;
  back_warm: string;
  left_warm: string;
  right_warm: string;
  heating: string;
  temp_set: number;
  temp_current: number;
  capacity_current: number;
  child_lock: boolean;
  status: string;
  stove_temp: number;
  add: boolean;
  minus: boolean;
  up_down: string;
  countdown_set: string;
  countdown_left: number;
  time_calibration: boolean;
  voice_heating: boolean;
  voice_warm: boolean;
  fault?: number;
  quiet: boolean;
  power_consumption: number;
  [key: string]: any;
}
interface BoxConfigs {
  [key: string]: any;
}
interface Images {
  [key: string]: any;
}
interface FunctionList {
  [key: string]: any;
}
interface InterfaceData {
  [key: string]: string;
}
interface CurvData {
  date: string;
  value: number;
}
interface ImgType {
  name: string;
  img: number;
  rotate: number;
  style?: {
    position?: string;
    width?: number;
    height?: number;
    marginRight?: number;
    marginBottom?: number;
    marginTop?: number;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  textStyle?: {
    marginTop?: number;
    marginBottom?: number;
    marginRight?: number;
    marginLeft?: number;
  };
  imgWH?: { width: number; height: number };
}
interface BicItem {
  code: string;
}
export { DpState, BoxConfigs, Images, FunctionList, CurvData, InterfaceData, ImgType, BicItem };

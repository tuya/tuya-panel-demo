declare module 'react-native-svg';

declare interface StoreState {
  dpState: {};
}

declare interface ConnectProps {
  suction?: string;
  workMode?: string;
  robotStatus?: string;
  updateDp(d: any): void;
}

declare interface IColour {
  hue: number;
  saturation: number;
  value: number;
}

declare interface SceneColor {
  isColour?: boolean;
  hue?: number;
  saturation: number;
  value: number;
  brightness: number;
  temperature: number;
}

declare interface SceneValue {
  id?: number;
  time?: number;
  mode?: number;
  speed?: number;
  colors?: SceneColor[];
}
declare interface SceneData {
  sceneId?: number;
  addTime?: number;
  pic?: any; // 小图
  picBig?: any; // 大图
  picMiddle?: any; // 中图
  isDefault?: boolean; // 是否为默认的配置
  isCustom?: boolean; // 是否为自定义产品
  picIndex?: number; // 自定义默认图序号
  name?: string;
  value?: string | SceneValue;
}

declare interface SceneCloudPic {
  sceneId?: number;
  fileUrl?: string;
}

declare interface IControllData {
  mode: number;
  hue: number;
  saturation: number;
  value: number;
  brightness: number;
  temperature: number;
}

declare interface CommonColor {
  name: string;
  pic: any;
  color: SceneColor;
}

declare interface UploadResponser {
  success: boolean;
  cloudKey: string;
  uri: string;
  fileSize: number;
}

declare module 'react-native-json-tree';

declare module '@tuya-rn/tuya-native-elements';

// declare module '@tuya-rn/tuya-native-lamp-elements' {
//   const WaterRipple: any;
// }

declare module '@tuya-rn/tuya-native-standard-elements' {
  const StandardUtils: {
    withProvider: any;
    withUIConfig: any;
  };

  interface DpCodes {
    power: string; // 开关
    cleanSwitch: string; // 清扫开关
    workMode: string; // 工作模式
    direction: string; // 方向
    robotStatus: string; // 工作状态
    electric: string; // 剩余电量
    edgeBrush: string; // 	边刷寿命
    rollBrush: string; // 滚刷寿命
    filter: string; // 滤网寿命
    resetEdgeBrush: string; // 边刷重置
    resetRollBrush: string; // 滚刷重置
    resetFilter: string; // 滤网重置
    seek: string; // 寻找机器
    suction: string; // 吸力选择
    cleanRecord: string; // 清扫记录
    cleanArea: string; // 清扫面积
    cleanTime: string; // 清扫时间
    fault: string; // 故障告警
    mapConfig: string; // 地图参数
  }

  const Config: {
    dpCodes: DpCodes;
    fontColor: string;
    themeColor: string;
    iconColor: string;
    setRoute(name: string, data: any): void;
    [x: string]: any;
  };

  const Utils: any;
}

// declare interface StoreState {
//   dpState: {};
// }

declare interface ConnectProps {
  suction?: string;
  workMode?: string;
  robotStatus?: string;
  updateDp(d: any): void;
}

declare interface ColourData {
  hue: number;
  saturation: number;
  value: number;
}

declare interface WhiteData {
  brightness?: number;
  temperature?: number;
}

declare interface CommonColorData {
  isColor?: boolean;
  hue?: number;
  saturation?: number;
  value?: number;
  brightness?: number;
  temperature?: number;
}

interface MicMusicData {
  v: number;
  power: boolean;
  id: number;
  isLight: number;
  mode: number;
  speed: number;
  sensitivity: number;
  a: number;
  b: number;
  c: number;
  brightness: number;
  colors: Unit[];
}

interface Unit {
  hue: number;
  saturation: number;
}

declare interface SceneValue {
  id?: number;
  time?: number;
  mode?: number;
  speed?: number;
  colors?: SceneColor[];
}
declare interface SceneData {
  sceneId: number;
  pic?: any; // 小图
  picBig?: any; // 大图
  picMiddle?: any; // 中图
  isDefault?: boolean; // 是否为默认的配置
  isCustom?: boolean; // 是否为自定义产品
  picIndex?: number; // 自定义默认图序号
  name: string;
  value: SceneValue;
}

declare interface SceneCloudPic {
  sceneId?: number;
  fileUrl?: string;
}

declare interface ControllData {
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

declare interface LocalMusicColor {
  hue: number;
  saturation: number;
}
declare interface LocalMusicValue {
  version: number;
  power: boolean;
  mode: number;
  speed: number;
  id: number;
  serialNumber: number;
  sensitivity: number;
  colors: LocalMusicColor[];
}

declare interface ColorUnit {
  hue: number;
  saturation: number;
  value: number;
  brightness: number;
  temperature: number;
}

declare interface RgbSceneColor {
  hue: number;
  saturation: number;
}
declare interface RgbSceneValue {
  version: number;
  id: number;
  mode: number;
  interval: number;
  time: number;
  settingA: number;
  settingB: number;
  settingC: number;
  brightness: number;
  colors: RgbSceneColor[];
}

declare interface RgbSceneData {
  sceneId: number;
  code: string;
  isDefault?: boolean; // 是否为默认的配置
  name: string;
  value: RgbSceneValue;
}

declare interface RandomTimerItem {
  power: boolean;
  channel: number;
  weeks: number[];
  startTime: number;
  endTime: number;
  color: {
    hue: number;
    saturation: number;
    value: number;
    brightness: number;
    temperature: number;
  };
}
declare interface RandomTimerItem {
  power: boolean;
  channel: number;
  weeks: number[];
  startTime: number;
  endTime: number;
  color: {
    hue: number;
    saturation: number;
    value: number;
    brightness: number;
    temperature: number;
  };
}

declare interface RandomTimerData {
  version: number;
  length: number;
  nodes: RandomTimerItem[];
}

declare interface CycleTimerItem {
  power: boolean;
  channel: number;
  weeks: number[];
  startTime: number;
  endTime: number;
  openTime: number;
  closeTime: number;
  color: {
    hue: number;
    saturation: number;
    value: number;
    brightness: number;
    temperature: number;
  };
}

declare interface CycleTimerData {
  version: number;
  length: number;
  nodes: CycleTimerItem[];
}

declare interface SleepItem {
  power: boolean;
  weeks: number[];
  delay: number;
  hour: number;
  minute: number;
  hue: number;
  saturation: number;
  value: number;
  bright: number;
  temperature: number;
}

declare interface SleepData {
  version: number;
  number: number;
  nodes: SleepItem[];
}

declare interface WakeupItem {
  power: boolean;
  weeks: number[];
  delay: number;
  hour: number;
  minute: number;
  hue: number;
  saturation: number;
  value: number;
  bright: number;
  temperature: number;
  last: number;
}

declare interface WakeupData {
  version: number;
  number: number;
  nodes: WakeupItem[];
}

declare interface RhythmItem {
  power: boolean;
  hour: number;
  minute: number;
  hue: number;
  saturation: number;
  value: number;
  brightness: number;
  temperature: number;
  icon?: string;
  name?: string;
}

declare interface RhythmData {
  version: number;
  power: boolean;
  mode: number;
  weeks: number[];
  number: number;
  rhythms: RhythmItem[];
}

/** 色盘类型 */
declare type ColorWeelType = 'wheel' | 'piece';

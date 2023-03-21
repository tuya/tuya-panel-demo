/* eslint-disable prettier/prettier */
import { StyleProp, ViewStyle } from 'react-native';

/** Home页签 */
export enum HomeTab {
  dimmer = 'dimmer',
  scene = 'scene',
  music = 'music',
  other = 'other',
}

export enum WorkMode {
  colour = 'colour',
  white = 'white',
  scene = 'scene',
  music = 'music',
}
export interface IControlData {
  mode?: number;
  hue: number;
  saturation: number;
  value: number;
  brightness?: number;
  temperature?: number;
}
/** 调光器模式 */
export enum DimmerMode {
  white,
  colour,
  colourCard,
  combination,
}

export type DimmerTab = keyof typeof DimmerMode;

/** 涂抹类型 */
export enum SmearMode {
  all,
  single,
  clear,
}

/** 调光器的value类型 */
export interface DimmerValue {
  colour?: ColourData;
  white?: WhiteData;
  colourCard?: ColourData;
  combination?: ColourData[];
}

export interface ColorUnitsProps {
  /**
   * 主题 深 / 浅
   */
  isDark: boolean;
  /**
   * 主题色
   */
  themeColor: string;
  /**
   * 是否只展示一个圆圈（只显示选中值）
   */
  isSingleCircle?: boolean;
  /**
   *  默认选中第几个圆圈
   */
  selectCircle: number;
  /**
   * 设置圆圈，返回设置类型，以及对应索引
   */
  handleToSetCircle: (type: any, index: number) => void;
  /**
   * 圆圈对应hsvbt数据组
   */
  circleArr: any[];
  /** 颜色单元最小个数 */
  minCircleNum?: number;
  /** 颜色单元最大个数 */
  maxCircleNum?: number;
  /**
   * 是否是彩光状态
   */
  isColorFul: boolean;
  /**
   * 是否支持彩光模式
   */
  isColorfulExist: boolean;
  /**
   * 是否支持白光
   */
  isWhiteExist: boolean;
  /**
   * 当前数据
   */
  currentData: {
    isColor?: boolean;
    hue?: number;
    saturation?: number;
    value?: number;
    brightness?: number;
    temperature?: number;
  };
}

/** 调光器Props */
export interface DimmerBoxProps {
  style?: StyleProp<ViewStyle>;
  styles?: Partial<Record<DimmerTab | 'topbar', StyleProp<ViewStyle>>>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  background?: string;
  blured?: boolean;
  disabled?: boolean;
  powerOff?: boolean;
  hideBright?: boolean;
  filterTabs?: (tab: string, index: number) => boolean;
  showColorUnits?: boolean;
  colorUnitsProps?: ColorUnitsProps;
  tab?: DimmerTab;
  onTabChange?: (tab: DimmerTab, ...args: any[]) => void;
  value?: DimmerValue;
  onChange?: (value: DimmerValue, ...args: any[]) => void;
}

/** 涂抹dp数据 */
export interface SmearDataType {
  /** 版本号 */
  version: number;
  /** 模式 (0: 白光, 1: 彩光, 2: 色卡, 3: 组合) */
  dimmerMode: DimmerMode;
  /** 涂抹效果 (0: 无, 1: 渐变) */
  effect?: number;
  /** 灯带UI段数 */
  ledNumber?: number;
  /** 涂抹动作 (0: 油漆桶, 1: 涂抹, 2: 橡皮擦) */
  smearMode?: SmearMode;
  /** 彩光色相 */
  hue?: number;
  /** 彩光饱和度 */
  saturation?: number;
  /** 彩光亮度 */
  value?: number;
  /** 白光亮度 */
  brightness?: number;
  /** 白光色温 */
  temperature?: number;
  /** 当前涂抹色是否是彩光 */
  isColour?: boolean;
  /** 点选类型(0: 连续，1: 单点) */
  singleType?: number;
  /** 当次操作的灯带数 */
  quantity?: number;
  /** 组合类型 */
  combineType?: number;
  /** 颜色组合 */
  combination?: ColourData[];
  /** 编号 */
  indexs?: Set<number>;
}

interface SceneColorType {
  hue: number;
  saturation: number;
}

/** 涂抹dp数据 */
export interface SceneValueType {
  /** 版本号(1byte) */
  version?: number;
  /** 场景号(自定义200+)(1byte) */
  id: number;
  /** 变化方式(1byte) */
  mode: number;
  /** 单元切换间隔(1byte) */
  // intervalTime: number;
  /** 单元变化时间(1byte) */
  // changeTime: number;
  speed?: number;
  /** 混合的场景号 */
  mixedIds?: number[];
  /**
   * Option_A(1byte)
   * 非混合情景模式下:
   *    segmented   7bit: 0-全段、1-分段
   *    loop        6bit: 0-不循环、1-循环
   *    excessive   5bit: 0-不过渡、1-过度
   *    direction   4bit: 0-顺时针方向、1-逆时针方向
   *    expand      3bit_2bit: 00-默认模式、01-拓展1、10-拓展2、11-拓展3
   *                           流星情景: 01-流星,10-流星雨,11-幻彩流星
   *                           开合情景: 01-同时,10-交错
   *    reserved_1  1bit: 无
   *    reserved_2  0bit: 无
   * 混合情景模式下: 场景号
   */
  // optionA?: number;
  segmented?: number;
  loop?: number;
  excessive?: number;
  direction?: number;
  expand?: number;
  reserved1?: number;
  reserved2?: number;
  /** Option_B(一期预留，二期混合模式用ABC表场景号)(1byte) */
  // optionB?: number;
  /** Option_C(一期预留，二期混合模式用ABC表场景号)(1byte) */
  // optionC?: number;
  /** 亮度(所有颜色公用一个亮度)(1byte) */
  brightness: number;
  /** 颜色单元(每个颜色3byte, hue: 2byte, saturation: 1byte) */
  colors: SceneColorType[];
}

export interface RgbMusicValue {
  id: number;
  mode: number;
  power: boolean;
  sensitivity: number;
  settingA: number;
  settingB: number;
  settingC: number;
  speed: number;
  version: number;
  colors?: [];
}
export interface SceneDataType {
  id: number;
  name: string;
  value: SceneValueType;
}

export enum SceneCategory {
  scenery,
  life,
  festival,
  mood,
  diy,
}

export type SceneCategoryTab = keyof typeof SceneCategory;

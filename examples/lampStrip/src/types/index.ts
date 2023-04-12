/* eslint-disable prettier/prettier */
import { StyleProp, ViewStyle } from 'react-native';

/** Home tab */
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
/** Dimmer mode */
export enum DimmerMode {
  white,
  colour,
  colourCard,
  combination,
}

export type DimmerTab = keyof typeof DimmerMode;

/** Smear type */
export enum SmearMode {
  all,
  single,
  clear,
}

/** Dimmer value type */
export interface DimmerValue {
  colour?: ColourData;
  white?: WhiteData;
  colourCard?: ColourData;
  combination?: ColourData[];
}

export interface ColorUnitsProps {
  /**
   * Theme dark / light
   */
  isDark: boolean;
  /**
   * Theme color
   */
  themeColor: string;
  /**
   * Whether to display only one circle (only show the selected value)
   */
  isSingleCircle?: boolean;
  /**
   * Default selected circle
   */
  selectCircle: number;
  /**
   * Set the circle, return the setting type and corresponding index
   */
  handleToSetCircle: (type: any, index: number) => void;
  /**
   * Circle corresponding hsvbt data group
   */
  circleArr: any[];
  /** Minimum number of color units */
  minCircleNum?: number;
  /** Maximum number of color units */
  maxCircleNum?: number;
  /**
   * Whether it is a colorful state
   */
  isColorFul: boolean;
  /**
   * Whether the colorful mode is supported
   */
  isColorfulExist: boolean;
  /**
   * Whether white light is supported
   */
  isWhiteExist: boolean;
  /**
   * Current data
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

/** Dimmer Props */
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

/** Smear dp data */
export interface SmearDataType {
  /** Version number */
  version: number;
  /** Mode (0: white light, 1: colorful light, 2: color card, 3: combination) */
  dimmerMode: DimmerMode;
  /** Smear effect (0: none, 1: gradient) */
  effect?: number;
  /** LED strip UI segments */
  ledNumber?: number;
  /** Smear action (0: paint bucket, 1: smear, 2: eraser) */
  smearMode?: SmearMode;
  /** Colorful light hue */
  hue?: number;
  /** Colorful light saturation */
  saturation?: number;
  /** Colorful light brightness */
  value?: number;
  /** White light brightness */
  brightness?: number;
  /** White light color temperature */
  temperature?: number;
  /** Whether the current smear color is colorful */
  isColour?: boolean;
  /** Point selection type (0: continuous, 1: single point) */
  singleType?: number;
  /** Number of LED strips operated this time */
  quantity?: number;
  /** Combination type */
  combineType?: number;
  /** Color combination */
  combination?: ColourData[];
  /** Number */
  indexs?: Set<number>;
}

interface SceneColorType {
  hue: number;
  saturation: number;
}

/** Smear dp data */
export interface SceneValueType {
  /** Version number (1byte) */
  version?: number;
  /** Scene number (custom 200+) (1byte) */
  id: number;
  /** Change mode (1byte) */
  mode: number;
  /** Unit switching interval (1byte) */
  // intervalTime: number;
  /** Unit change time (1byte) */
  // changeTime: number;
  speed?: number;
  /** Mixed scene number */
  mixedIds?: number[];
  /**
   * Option_A(1byte)
   * In non-mixed scene mode:
   *    segmented   7bit: 0-whole segment, 1-segmented
   *    loop        6bit: 0-non-circular, 1-circular
   *    excessive   5bit: 0-no transition, 1-transition
   *    direction   4bit: 0-clockwise direction, 1-counterclockwise direction
   *    expand      3bit_2bit: 00-default mode, 01-expansion 1, 10-expansion 2, 11-expansion 3
   *                           Meteor scene: 01-meteor, 10-meteor shower, 11-fantasy meteor
   *                           Open and close scene: 01-simultaneous, 10-staggered
   *    reserved_1  1bit: none
   *    reserved_2  0bit: none
   * In mixed scene mode: scene number
   */
  // optionA?: number;
  segmented?: number;
  loop?: number;
  excessive?: number;
  direction?: number;
  expand?: number;
  reserved1?: number;
  reserved2?: number;
  /** Option_B (reserved for the first phase, used for ABC table scene number in the second phase mixed mode) (1byte) */
  // optionB?: number;
  /** Option_C (reserved for the first phase, used for ABC table scene number in the second phase mixed mode) (1byte) */
  // optionC?: number;
  /** Brightness (all colors share one brightness) (1byte) */
  brightness: number;
  /** Color unit (each color 3byte, hue: 2byte, saturation: 1byte) */
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
  key?: string;
  name: string;
  category?: string;
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

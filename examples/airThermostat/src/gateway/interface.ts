/**
 * hsv 颜色
 */
export interface Color {
  hue: number;
  saturation: number;
  value: number;
}

export interface WhiteColor {
  brightness: number; // 白光亮度
  temperature: number; // 白光色温
}

export enum SchemaType {
  RAW = 'raw',
  Boolean = 'bool',
  String = 'string',
  Enum = 'enum',
  Number = 'value',
  BitMap = 'bitmap',
  Unknow = 'unknow',
}

export type SchemaDataType = string | number | boolean | Color | any;

export interface DpSchema {
  code: string;
  desc?: string;
  dptype?: string;
  iconname?: string;
  id: number;
  max?: number;
  min?: number;
  mode: 'rw' | 'wr';
  name?: string;
  scale?: number;
  step?: number;
  range?: string[];
  maxlen?: number; // string type 下的最大长度
  type: SchemaType;
  validate: (value: SchemaDataType) => boolean;
  format: (value: SchemaDataType) => SchemaDataType;
}

export interface DpSchemas {
  [key: string]: DpSchema;
}

export interface DpData {
  [key: string]: boolean | number | string | Color | any;
}

export interface BaseWorker {
  status: any;
  time: number; // 发送时间，用于定位是否超时
}

export interface IDpWorker extends BaseWorker {
  originData: DpData;
  data: DpData;
  // 是否超时
  isTimeout: (timeout: number) => boolean;
  // 校验数据
  compare: (value: any) => boolean;
  // 是否可发送
  sendEnabled: () => boolean;

  /**
   * 发送
   * @param option 发送配置
   */
  send: (option: SendOption) => Promise<any>;
}

/**
 * 格式化器
 * 用于转换数据及判别数据是否相等
 */
export interface IFormater {
  uuid: string;
  schema: DpSchema | null;

  /**
   * 比较两个值是否一致
   */
  equal: (source: SchemaDataType, target: SchemaDataType) => boolean;

  /**
   * 将标准协议数据转为项目数据
   */
  parse: (value: SchemaDataType) => SchemaDataType;

  /**
   * 将数据转为标准协议数据
   */
  format: (value: SchemaDataType) => SchemaDataType;
}

export interface Formaters {
  [key: string]: IFormater;
}

export interface IDpQueueDataItem {
  value: any;
  time: number;
  isReply: boolean;
}

export interface IDpQueueData {
  [code: string]: IDpQueueDataItem[];
}

export interface IDpQueue {
  data: IDpQueueData;
  add: (data: DpData, config: Config) => void;
  filterDp: (data: DpData) => DpData;
  clearTimeOut: () => void;
}

export interface DpCallback {
  (data: DpData, originData?: DpData): any;
}

/**
 * 音效配置
 */
export interface VoiceOption {
  default: number; // 默认值
  [dpCode: string]: number; // 当某个dp设置时，音效以此值为准
}

/**
 * 规则条件
 * 为 DpData 类型时，表示目标 dp 数据需要满足 key = value 才会触发规则
 * 为 String 类型时，表示目标 dp 数据存在此 dp 时，才会触发规则
 */
export type Condition = DpData | DpData[] | string[] | 'ALL';
/**
 * 规则数据
 */
export interface Rule {
  /**
   * 规则类型
   * FORBIDDEN 表示当前 dp 数据必须满足条件，不允许下发的 dp
   * PASS 表示当前 dp 数据必须满足条件，支持下发的 dp
   * NEED 表示当下发的数据满足条件时，添加设置的 dp 值
   */
  type: 'FORBIDDEN' | 'PASS' | 'NEED';
  /**
   * 规则条件
   * 当 type 为 STOP 时，使用 DpData[] 类型，并会在当前所有 dp 数据中判断
   * 当 type 为 NEED 时，使用 String[] 或 ALL，并会在待下发的 dp 数据中判断
   */
  condition: Condition;
  conditionType?: 'AND' | 'OR'; // 多条件比较方式，默认为 AND
  /**
   * 规则影响
   * 当 type 为 STOP 时，使用 String[] 类型，表示待下发的数据中，如果存在这些 dp ，则不下发
   * 当 type 为 NEED 时，使用 DpData 类型，表示在待下发的 dp 数据中，插入 dp 数据
   */
  effect: string[] | DpData;
}

/**
 * dp 协议具体映射关系
 * 每个dp协议中只能有一个属性为可循环解析，且循环只能放在最后
 */
export interface DpMapItem {
  name: string; // 映射后的名称
  length: number; // 在dp值中对应的截取的长度
  /**
   * 映射的属性对应类型
   * number 数据
   * boolean 布尔
   * string 字符串
   * child 子级数据
   * complex 复合属性，使用此类型时，需要配置childMap 或 parse 和 format。
   *         在解析时，工具库会将解板得到的对象合并到当前的节点中；
   *         在反解析时，工具库会使用当前节点对应的属性进行反解析。
   */
  type?: 'number' | 'boolean' | 'string' | 'child' | 'complex'; // 映射的属性对应类型
  loop?: boolean; // 是否循环处理
  decimal?: number; // 当为数值类型时，截取的值的进制
  childMap?: DpMapItem[]; // 当为child子属性类型时，子属性的协议映射关系
  /**
   * 自定义协议段数据转为对象数据方法
   * @param value 当前属性数据
   * @param dpMap 当前属性的映身配置
   * @param data 与当前属性同级的数据
   */
  parse?: (value: string, dpMap?: DpMapItem, data?: any) => any;
  /**
   * 自定义对象数据转为协议段数据方法
   * @param value 当前属性数据
   * @param dpMap 当前属性的映身配置
   * @param data 与当前属性同级的数据
   */
  format?: (value: any, dpMap?: DpMapItem, data?: any) => string;
  default?: any; // 无法映射时的默认植，若不填写，数据类型默认值为0；布尔类型默认为false；字符串类型默认为同等长度由0组成的值。注：child类型以其央射规则生成默认值
  /**
   * 列表中有多少个元素
   * 当loop 为true时有效
   * 如果为数值，则表示列表的长度
   * 如果为字符串，则会在同级的map中查找对应属性的值，并此值为列表长度
   */
  limit?: number | string;
}

export type DpMap = Array<DpMapItem> | Array<Array<DpMapItem>>;

/**
 * dp 协议映射配置
 * 一个dp 点可对应多个映射
 */
export interface DpMapSetting {
  [code: string]: DpMap;
}

export interface SendOption {
  /**
   * 音效配置
   * 0，静音； 1，震动；2,声音； 3，震动声音
   */
  voice?: number;

  /**
   * 更新数据时机
   * syncs 表示下发的同时，更新数据
   * replay 表示上报才更新数据
   * 此配置优先级高于 config 中的 updateValidTime 配置
   */
  updateValidTime?: 'syncs' | 'reply';

  /**
   * 开启节流
   * 此配置优先级高于 config 中的 openThrottle 配置
   */
  useThrottle?: boolean;

  /**
   * 取消当前节流
   * 开启后，当存在节流时，上一个节流会被取消
   */
  clearThrottle?: boolean;

  /**
   * 下发时，是否检测 dp 点的当前值是否一致，如果一致，则不下发
   * 此配置优先级高于 config 中的 checkCurrent 配置
   */
  checkCurrent?: boolean;
}

export interface Config {
  /**
   * dp下发记录超时时间
   *
   */
  timeOut: number;
  /**
   * 上报有报比较方式
   * single: 比较过滤上报数据中各个 dp 是否有效
   * double: 先比较下发与上报的数据是否一致，如果一致，再比较过滤上报数据中各个 dp 是否有效
   */
  compareType: 'single' | 'double';

  schema: DpSchemas;

  formaters: IFormater[];

  /**
   * 是否校验dp点的有效性
   */
  validateEnabled: boolean;

  /**
   * dp 点相关性校验
   * 如 只有在场景工作模式下，才能下发场景
   * 如 关灯情况下，下发dp时，自动开灯
   */
  rules: Rule[];

  /**
   * 设置的dp 将不会被记录到 dp 队列中
   */
  excludeDp: string[];

  /**
   * 音效配置
   */
  voiceOption: VoiceOption;

  /**
   * 是否检测下发 dp 数据与当前 dp 数据一致
   * 如果一致，则不下发，否则下发
   */
  isValidateLast: boolean;

  /**
   * 映射方式解析协议
   */
  dpMap?: DpMapSetting;

  /**
   * 更新数据时机
   * syncs 表示下发的同时，更新数据
   * replay 表示上报才更新数据
   */
  updateValidTime?: 'syncs' | 'reply';

  /**
   * 是否开启节流
   * 默认关闭
   */
  openThrottle?: boolean;
  /**
   * 节流间隔时间
   * 默认300ms
   */
  throttleWaitTime?: number;

  /**
   * 下发时，是否检测 dp 点的当前值是否一致，如果一致，则不下发
   * 默认 false
   */
  checkCurrent?: boolean;

  /**
   * 下发dp的方法
   */
  putDpData?: (data: DpData, option?: number) => Promise<{ success: boolean }>;
}

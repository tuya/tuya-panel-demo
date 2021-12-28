import { DpValue } from 'tuya-panel-kit';
// ResourceType可选值及其含义
export enum EResourceType {
  device = 0, // 设备
  group = 1, // 群组
  scene = 4, // 一键执行
}

// ActionType可选值及其含义
export enum EActionType {
  smartHome = 'smart_home', // 设备
  appScene = 'app_scene', // 场景
  tts = 'tts', // 应答
  weather = 'weather', // 天气
  news = 'news', // 新闻
  story = 'story', // 故事
}

// 从app方法获取到的设备格式
export interface IDevItemFromApp {
  capability: number;
  category: string;
  devId: string;
  dps: { string: any };
  iconUrl: string;
  isOnline: true;
  mac: string;
  meshId: null;
  name: string;
  nodeId: string;
  pcc: string;
  productId: string;
  quickOpDps: [];
  roomId: number;
  switchDp: number;
  uuid: string;
}

// 从云端接口获取到的设备格式
export interface IDevItemFromAPI {
  resourceId: string;
  resourceType: EResourceType;
  deviceDisplayShowDetail: IDevDetail;
  groupDisplayShowDetail: IGroupDetail;
}
export interface IDevDetail {
  devId: string;
  iconUrl: string;
  category: string;
  name: string;
  productId: string;
  // 房间id，配在房间下才会显示
  roomId?: number;
  // 是否支持快捷开关，用于过滤
  quickSwitch: boolean;
}

export interface IGroupDetail {
  id: string;
  icon: string;
  category: string;
  name: string;
  productId: string;
  // 房间id，配在房间下才会显示
  roomId?: number;
  deviceNum: number;
  groupType: number;
  standard: boolean;
  type: number;
  localKey: string;
  masterDevId: string;
  masterNodeId: string;
  ownerId: string;
  pv: string;
  uid: string;
}

// 格式化后的设备列表项
export interface IFormatDeviceItem {
  devId: string;
  iconUrl: string;
  category: string;
  name: string;
  productId: string;
  // 房间id，配在房间下才会显示
  roomId?: number;
  roomName?: string;
  resourceType: EResourceType;
  resourceId: string;
}

export interface ISceneItem {
  name: string;
  id: string;
  coverIcon: string;
  displayColor: string;
  enabled: boolean;
  background: string;
}
export interface IRoomItem {
  name: string;
  roomId: number;
}

// saveVoiceScene方法的参数子项
export interface ISaveVoiceScene {
  actions: IVoiceSceneAction[];
  name: string;
  rules: IVoiceSceneRule[];
  scopeId: string | number;
  sourceDevId: string;
  id?: string;
}

// 语音场景列表的子项
export interface IVoiceSceneItem extends ISaveVoiceScene {
  enabled: number;
  voiceDevId: string;
  voiceText: string;
}

export interface IVoiceSceneAction {
  action: IAction;
  actionType: EActionType;
  desc: string;
  duration?: number;
  entityId: string;
}
export interface IAction {
  dps?: IDps[];
  intelligentSceneId?: string;
  ttsText?: string;
  commandText?: string;
  entityName?: string;
}
export interface IDps {
  dpId: number;
  dpValue: DpValue;
}

// DragSort组件的dataSource
export interface IDragSortDataSource extends IVoiceSceneAction {
  key: string;
  txt: string;
}

export interface IVoiceSceneRule {
  matchType?: string;
  ruleTriggerConditions: IRuleTriggerConditions[];
  triggerType: 'voice' | 'auto_condition';
}
export interface IRuleTriggerConditions {
  condition: string;
}

export interface ISupportLinkageRes {
  deviceIds: string[];
  exts: { [key: string]: { uid: string } };
  groupIds: string[];
}

export interface IDeviceDPInfo {
  actDetail: string;
  defaultValue: boolean;
  dpId: number;
  dpName: string;
  id: number;
  name: string;
  orderNum: number;
  productId: string;
  status: number;
  valueRangeDisplay: string;
  valueRangeJson?: Array<Array<any>>;
}

export interface IChooseDpItem {
  id: number;
  chosenDpInfo: any[];
}

export interface ISceneForVoiceItem {
  id: string;
  name: string;
}

export interface IConditionItem {
  entityId: string;
  entityName: string;
  entitySubId: string;
  entityType: number;
  i18nCode: string;
  id: number;
  name: string;
  operators: string;
  orderNum: number;
  trigger: number;
  triggerStrategy: string;
  valueRangeDisplay: string;
  valueRangeJson: any[];
}

export interface IDevInstructItem {
  functionSchemaList: any[];
  statusSchemaList: any[];
  productId: string;
}

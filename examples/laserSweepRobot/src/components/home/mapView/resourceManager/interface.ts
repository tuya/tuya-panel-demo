import { OSSMapType } from './api/ossEvent';

/**
 * 内部状态存储
 */
export interface IStore {
  [index: string]: any;
}

/**
 * 任务
 */
export interface ITask {
  /**
   * 任务驱动动作
   * @params store 指自身的store
   * @params nextData 来源为该动作的source提供
   */
  action: (
    store: IStore,
    nextData: any,
    elementConfigs: IElementConfigs
  ) => IStore | Promise<IStore>;
  /**
   * 任务驱动来源
   * @params store 指自身的store
   * @params next 传递下一步的数据
   */
  source: (
    store: IStore,
    next: (nextData?: any) => void,
    elementConfigs: IElementConfigs
  ) => () => void | Promise<void>;
}
export interface IAutoTask {
  [index: string]: ITask;
}
/**
 * 组件Props
 */
export interface IElementProps {
  /**
   * 格式化该属性的方法
   * @params store 指自身的store
   * @params configs props配置
   */
  format: (store: IStore, configs: IElementConfigs) => any;
  /**
   * 校验属性
   * @params store 指自身的store
   * @params configs props配置
   */
  validate: (value: any) => boolean;
}
export interface IElementPropsSchema {
  [index: string]: IElementProps;
}

/**
 * 组件配置
 */
export interface IElementConfigs {
  [index: string]: any;
}

/**
 * 组件事件声明
 */
export interface IElementEvent {
  onEvent: (events: any, store: IStore, configs: IElementConfigs) => void;
}
export interface IElementEventSchema {
  [index: string]: IElementEvent;
}

/**
 * 配置
 */
export interface IConfig {
  store: IStore;
  autoTask: IAutoTask;
  elementPropsSchema: IElementPropsSchema;
  elementConfigs: IElementConfigs;
  elementEvent: IElementEventSchema;
}

export interface IEvent {
  events: {
    [index: string]: any[];
  };
  subscribe: (event: string, callback: () => void) => void;
  publish: (event: string, args?: any[]) => void;
}

export interface ITaskOpts {
  event: IEvent;
}

export interface IOSSCallback {
  mapType: OSSMapType;
  mapPath: string;
}

export interface IDpData {
  [key: string]: boolean | number | string | any;
}

export type FileType = 'blob' | 'text';

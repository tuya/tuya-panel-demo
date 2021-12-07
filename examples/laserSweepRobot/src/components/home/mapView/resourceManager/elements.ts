/* eslint-disable no-restricted-syntax */
import _ from 'lodash';

import { IElementPropsSchema, IElementConfigs, IElementEventSchema } from './interface';
import Store from './store';

/**
 * props处理类
 *
 * @export
 * @class Elements
 */
export default class Elements {
  elementConfigs: IElementConfigs = {};

  constructor(elementConfigs: IElementConfigs) {
    this.elementConfigs = elementConfigs;
  }

  /**
   * 更新element配置
   * @param nextConfig
   */
  updateElementConfigs(nextConfig: IElementConfigs) {
    const newConfig = _.mergeWith(this.elementConfigs, nextConfig, (curValue, srcValue) => {
      if (_.isArray(srcValue)) {
        return srcValue;
      }
    });
    Object.assign(this.elementConfigs, newConfig);
  }

  /**
   * 获取ElementConfigs配置
   */
  getElementConfigs() {
    return this.elementConfigs;
  }

  /**
   * 获取props属性
   *
   * @param {Store} localStore
   * @returns
   * @memberof Elements
   */
  getElementProps(localStore: Store, elementPropsSchema: IElementPropsSchema) {
    const propsList = Object.keys(elementPropsSchema);
    const nextProps: { [index: string]: any } = {};
    for (const prop of propsList) {
      const { format, validate } = elementPropsSchema[prop];
      const propValue = format(localStore.getStore(), this.elementConfigs);
      if (validate(propValue)) {
        nextProps[prop] = propValue;
      }
    }
    return nextProps;
  }

  /**
   * 设置组件事件
   *
   * @param {Store} localStore
   * @param {IElementEventSchema} elementEvent
   * @returns
   * @memberof Elements
   */
  getElementEvents(localStore: Store, elementEvent: IElementEventSchema) {
    const eventList = Object.keys(elementEvent);
    const events: { [index: string]: any } = {};
    for (const eventName of eventList) {
      const { onEvent } = elementEvent[eventName];
      events[eventName] = (event: any) => {
        onEvent && onEvent(event, localStore, this.elementConfigs);
      };
    }
    return events;
  }
}

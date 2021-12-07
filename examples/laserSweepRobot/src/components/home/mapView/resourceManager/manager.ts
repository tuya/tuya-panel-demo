import Store from './store';
import Task from './task';
import Elements from './elements';
import Events, { commonEvents } from './events';
import { throttle } from './utils/tool';

import { IConfig, IElementConfigs, IEvent } from './interface';

export default class Manager {
  config: IConfig;

  events: Events;

  store: Store;

  task: Task;

  elements: Elements;

  constructor(config: IConfig) {
    /**
     * 存储配置
     */
    this.config = config;
    /**
     * 创建事件方法
     */
    this.events = new Events();

    /**
     * 声明内部store
     */
    this.store = new Store(config.store);

    /**
     * 执行每个task，将每个source的数据传递至action
     */
    this.task = new Task();
    // task.runAutoTask(localStore, config.autoTask, events);

    /**
     * 创建组件props方法
     */
    this.elements = new Elements(config.elementConfigs);
  }

  /**
   * 运行任务
   *
   * @returns
   * @memberof Manager
   */
  createRunTask() {
    this.task.runAutoTask(this.store, this.config.autoTask, this.elements, this.events);
    return () => {
      // 返回取消订阅方法
      this.task.uninstallTask();
    };
  }

  /**
   * 订阅数据，返回定义的elementPropsSchema对象
   *
   * @param {(props: any) => void} callback
   * @returns
   * @memberof Manager
   */
  createElementPropsSubscription(callback: (props: any) => void) {
    // const update = throttle(() => {
    //   const props = this.elements.getElementProps(this.store, this.config.elementPropsSchema);
    //   callback && callback(props);
    // }, 2000);

    const update = () => {
      const props = this.elements.getElementProps(this.store, this.config.elementPropsSchema);
      callback && callback(props);
    };

    this.events.subscribe(commonEvents.updateProps, update);

    return () => {
      // 返回取消订阅方法
      this.events.unsubscribe(commonEvents.updateProps, update);
    };
  }

  /**
   * 获取定义的ElementEvent对象
   *
   * @returns
   * @memberof Manager
   */
  getElementEvents() {
    const event = this.elements.getElementEvents(this.store, this.config.elementEvent);
    return event;
  }

  /**
   * 订阅数据，返回本地数据
   *
   * @param {(store: any) => void} callback
   * @returns
   * @memberof Manager
   */
  createStoreSubscription(callback: (store: any) => void) {
    const update = () => {
      const store = this.store.getStore();
      callback && callback(store);
    };

    this.events.subscribe(commonEvents.updateStore, update);
    return () => {
      // 返回取消订阅方法
      this.events.unsubscribe(commonEvents.updateStore, update);
    };
  }

  /**
   * 更新组件配置
   *
   * @param {IElementConfigs} eleConfig
   * @memberof Manager
   */
  updateElementConfigs(eleConfig: IElementConfigs) {
    this.elements.updateElementConfigs(eleConfig);
    this.events.publish(commonEvents.updateProps);
    // this.events.publish(commonEvents.updateEvent);
  }
}

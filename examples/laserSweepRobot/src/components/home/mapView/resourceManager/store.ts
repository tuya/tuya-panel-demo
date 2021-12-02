import { IStore, IEvent } from './interface';
import { commonEvents } from './events';

/**
 * 内部store
 */
export default class LocalStore {
  private store: {};

  constructor(data: IStore) {
    this.store = data;
  }

  getStore() {
    return this.store;
  }

  update(data: IStore, event: IEvent) {
    Object.assign(this.store, data);
    // DONE: 需要一个事件中心，将数据更新完成事件推送出去
    event.publish(commonEvents.updateStore);
    event.publish(commonEvents.updateProps);
  }
}

import { IEvent } from './interface';

export enum commonEvents {
  updateStore = 'updateStore',
  updateProps = 'updateProps',
  updateEvent = 'updateEvent',
}
export default class Events {
  // static instance: Events;

  // static getInstance() {
  //   if (Events.instance) return Events.instance;
  //   else {
  //     Events.instance = new Events();
  //     return Events.instance;
  //   }
  // }

  events: {
    [index: string]: any[];
  };

  constructor() {
    // 一个对象存放所有的消息订阅
    // 每个消息对应一个数组，数组结构如下
    // {
    //   "event1": [cb1, cb2]
    // }
    this.events = {};
  }

  subscribe(event: string | commonEvents, callback: () => void) {
    if (this.events[event]) {
      // 如果有人订阅过了，这个键已经存在，就往里面加就好了
      this.events[event].push(callback);
    } else {
      // 没人订阅过，就建一个数组，回调放进去
      this.events[event] = [callback];
    }
  }

  publish(event: string | commonEvents, ...args) {
    // 取出所有订阅者的回调执行
    const subscribedEvents = this.events[event];

    if (subscribedEvents && subscribedEvents.length) {
      subscribedEvents.forEach(callback => {
        callback.call(this, ...args);
      });
    }
  }

  unsubscribe(event: string | commonEvents, callback) {
    // 删除某个订阅，保留其他订阅
    const subscribedEvents = this.events[event];

    if (subscribedEvents && subscribedEvents.length) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  clear() {
    // 删除该实例所有订阅
    this.events = {};
  }
}

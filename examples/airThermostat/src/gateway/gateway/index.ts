import DpWorker from '../worker/DpWorker';
import DpQueueManager from './DpQueue';
import configUtils, { getConfig } from '../configUtils';
import { getFormater } from '../format/index';
import DpMapFactory from '../factory/DpMapFactory';
import { hasProp, getValue } from '../utils';
import { Config, DpData, IDpWorker, DpCallback, SendOption } from '../interface';

const gatwayDpData: DpData = {};

const workers: IDpWorker[] = [];

// dp 更新回调处理函数
const callbacks: DpCallback[] = [];

// 下发 dp 前回调处理函数
const beforeCallbacks: DpCallback[] = [];

let lastSendTime = +new Date();
let lastWorker: IDpWorker | null = null;
let cancelSendHandle: null | (() => void) = null;

const cancelThrottle = () => {
  if (lastWorker) {
    cancelSendHandle && cancelSendHandle();
    lastWorker = null;
    cancelSendHandle = null;
  }
};
/**
 * 下发 dp 数据
 * @param data 下发的数据
 * @param option
 */
export const sendDp = async (data: DpData, option: SendOption) => {
  const { useThrottle, clearThrottle, checkCurrent } = option;
  let config: Config = configUtils.getConfig();
  // 此次下发数据是否设置了需要检测当前值
  if (typeof checkCurrent !== 'undefined') {
    config = { ...config, checkCurrent };
  }
  const worker: IDpWorker = new DpWorker(data, config);

  const { openThrottle, throttleWaitTime = 300, compareType } = config;

  // 是否可以发送
  if (!worker.sendEnabled()) {
    return Promise.reject(new Error('DP 数据不正确'));
  }
  // 清除节流
  if (clearThrottle) {
    cancelThrottle();
  }
  // 开启节流处理
  if (useThrottle || (typeof useThrottle === 'undefined' && openThrottle)) {
    const now = +new Date();
    // 未到达节流时间
    if (now - lastSendTime <= throttleWaitTime) {
      // 中断上一个等待的下发命令
      cancelThrottle();

      lastWorker = worker;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve({ code: 'SENDED', msg: 'send Data' });
        }, throttleWaitTime + lastSendTime - now);
        // 替换取消方法
        cancelSendHandle = () => {
          // 使用reject会造成开发时控制台打印过多的警告信息，过多的警告信息会导致本地开发页面卡顿
          // 所以使用 resolve 使用处理
          resolve({ code: 'BREAK', errMsg: 'break throttle' });
          clearTimeout(timer);
        };
      }).then((res: any) => {
        if (lastWorker && res.code === 'SENDED') {
          if (compareType === 'double') {
            workers.push(lastWorker);
          }
          doBeforeCallback(lastWorker.data);
          DpQueueManager.add(lastWorker.data, config);
          const temp = lastWorker;
          lastSendTime = +new Date();
          lastWorker = null;
          cancelSendHandle = null;
          return temp.send(option);
        }
        return res;
      });
    }
    lastSendTime = now;
  }

  // 仅需要严格比较时记录 worker
  if (compareType === 'double') {
    workers.push(worker);
  }
  doBeforeCallback(worker.data);
  // 记录下发的 dp 数据
  DpQueueManager.add(worker.data, config);
  return worker.send(option);
};

/**
 * 检测上报数据是否存在于下发数据队列中
 * @param data 上报的数据
 * @param timeOut 超时时间
 */
const isExistWorker = (data: DpData, timeOut: number) => {
  const lastIndex = workers.length - 1;
  for (let i = lastIndex; i >= 0; i--) {
    const worker = workers[i];
    if (worker.isTimeout(timeOut)) {
      workers.splice(0, i + 1);
      break;
    }
    if (worker.compare(data)) {
      return true;
    }
  }
  return false;
};

/**
 * 初始化 dp 数据
 * @param data 初始化 dp 协议数据
 */
export const initDp = (data: DpData) => {
  const { dpMap = {} } = getConfig();
  Object.keys(data).forEach(code => {
    let value = data[code];
    // 是否有映射关系配置
    if (hasProp(dpMap, code)) {
      // 使用映射规则将标准dp协议数据转化为可描述dp对象数据
      value = DpMapFactory.parse(dpMap[code], value);
    } else {
      // 初始化的数据为dp标准协议数据，需要转化为普通数据
      const formater = getFormater(code);
      if (formater) {
        value = formater.parse(value);
      }
    }
    gatwayDpData[code] = value;
  });

  // 调用数据变更监听
  updateDp({ ...gatwayDpData });
};

/**
 * 收上报 dp 数据
 * @param data 上报的数据
 */
export const receiveDp = (data: DpData) => {
  const { timeOut, compareType } = configUtils.getConfig();
  // 比较数据
  if (compareType === 'single' || isExistWorker(data, timeOut)) {
    const result = DpQueueManager.filterDp(data);
    // 同步数据
    Object.keys(result).length && updateDp(result);
  }
};

export const updateDp = (data: any) => {
  // 同步数据
  const temp = { ...gatwayDpData };
  Object.assign(gatwayDpData, data);
  const originData = { ...data };
  // 后注册的先跑，如果处理方法有返回数据，如果返回false， 则终断其他回调不执行，否则下一个监听器会使用此数据做为第一参数
  for (let i = callbacks.length - 1; i >= 0; i--) {
    const cb = callbacks[i];
    if (typeof cb === 'function') {
      const result = cb(data, temp);
      if (result === false) {
        break;
      }
    }
  }
};

export const registerUpdateCallback = (callback: DpCallback) => {
  callbacks.push(callback);
};

export const removeUpdateCallback = (callback: DpCallback) => {
  const index = callbacks.indexOf(callback);
  if (index >= 0) {
    callbacks.splice(index, 1);
  }
};

export const registerBeforeCallback = (callback: DpCallback) => {
  beforeCallbacks.push(callback);
};

export const removeBeforeCallback = (callback: DpCallback) => {
  const index = beforeCallbacks.indexOf(callback);
  if (index >= 0) {
    beforeCallbacks.splice(index, 1);
  }
};

/**
 * 执行下发数据前回调处理
 * @param data dp 数据
 */
export const doBeforeCallback = async (data: any) => {
  const originData = { ...data };
  // 后注册的先跑，如果处理方法有返回数据，如果返回false， 则终断其他回调不执行，否则下一个监听器会使用此数据做为第一参数
  for (let i = beforeCallbacks.length - 1; i >= 0; i--) {
    const cb = beforeCallbacks[i];
    if (typeof cb === 'function') {
      const result = cb(data, gatwayDpData);
      if (result === false) {
        break;
      }
    }
  }
};

export const getDpByCode = (code: string): any => {
  if (hasProp(gatwayDpData, code)) {
    return getValue(gatwayDpData, code);
  }
  return null;
};

export const hasInDps = (data: DpData) => {
  if (typeof data === 'object') {
    return Object.keys(data).every(code => {
      const value = data[code];
      const target = getDpByCode(code);
      return value === target;
    });
  }
  return false;
};

export default {
  sendDp,
  receiveDp,
  getDpByCode,
};

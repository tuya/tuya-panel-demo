import { TYSdk } from 'tuya-panel-kit';
import _isUndefined from 'lodash/isUndefined';
import _isFunction from 'lodash/isFunction';
import CustomError from '../customErrorUtil';
import logger from '../loggerUtil';

/**
 * 按顺序执行Promise，等待前一个Promise完成，再执行下一个。
 *
 * @param {Array} promises
 * @returns {Array | undefined}
 */
async function sequencePromise(...promises: any[]) {
  const { length } = promises;
  if (length === 0) return;
  if (length === 1) return [await promises[0]()];
  const results = [];
  for (let index = 0; index < length; index++) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await promises[index]());
  }
  return results;
}

function handleError(e: Error) {
  CustomError.handleError(e);
}

/** 创建单例 */
export const createSingleton = (createInstance: () => any) => {
  let instance: any;
  return () => {
    if (instance) return instance;
    if (!instance) {
      instance = createInstance();
    }
    return instance;
  };
};

/**
 * 等待下一个符合期待的dp值
 *
 * @param {ExpectValues[]} expectValues
 */

type ExpectValues = {
  dpCode: string;
  value?: any;
  comparator?: (dpValue: any) => boolean;
};

interface expectValuesOpts {
  onError?: (e: Error) => void; // 如果传入处理错误方式，错误处理都走这个
}

export function awaitExpectDpsState(
  expectValues: ExpectValues[],
  timeOut = 32000,
  opts: expectValuesOpts = {}
) {
  return new Promise((resolve, reject) => {
    let flag = 0;
    let timeCheck = 0;
    const nowTime = new Date().getTime();
    // const timeOut = 1;

    const handle = (data: any) => {
      const { type, payload } = data;
      if (type !== 'dpData') return;

      try {
        expectValues.forEach(({ dpCode, value, comparator }) => {
          // 一项dp符合期望时flag+1，flag大于0且不符合期望时-1；直到flag === 期望dp数量
          if (_isUndefined(payload[dpCode])) return;
          if (_isFunction(comparator)) {
            if (comparator(payload[dpCode])) flag++;
            if (!comparator(payload[dpCode]) && flag !== 0) flag--;
          } else {
            if (payload[dpCode] === value) flag++;
            if (payload[dpCode] !== value && flag !== 0) flag--;
          }
        });

        if (flag === expectValues.length) {
          resolve(true);
          TYSdk.event.remove('deviceDataChange', handle);
          clearInterval(timeCheck);
        }
      } catch (error) {
        TYSdk.event.remove('deviceDataChange', handle);
        clearInterval(timeCheck);
        if (opts.onError) {
          opts.onError(error);
          return;
        }
        resolve(false);
      }
    };
    TYSdk.event.on('deviceDataChange', handle);

    timeCheck = setInterval(() => {
      if (new Date().getTime() - nowTime >= timeOut) {
        logger.info('dp上报超时，取消等待');
        TYSdk.event.remove('deviceDataChange', handle);
        clearInterval(timeCheck);
        if (opts.onError) {
          opts.onError(new Error('DpTimeOut'));
          return;
        }
        resolve(false);
      }
    });
  });
}

export function awaitExpectMapStoreState(expectValues: ExpectValues[], timeOut = 32000) {
  return new Promise((resolve, reject) => {
    let flag = 0;
    let timeCheck = 0;
    const nowTime = new Date().getTime();
    // const timeOut = 1;

    const handle = (data: any) => {
      expectValues.forEach(({ key, value, comparator }) => {
        // 一项key符合期望时flag+1，flag大于0且不符合期望时-1；直到flag === 期望dp数量
        if (_isUndefined(data[key])) return;
        if (_isFunction(comparator)) {
          if (comparator(data[key])) flag++;
          if (!comparator(data[key]) && flag !== 0) flag--;
        } else {
          if (data[key] === value) flag++;
          if (data[key] !== value && flag !== 0) flag--;
        }
      });

      if (flag === expectValues.length) {
        resolve(true);
        TYSdk.event.remove('robot_receive_mapStateChange', handle);
        clearInterval(timeCheck);
      }
    };
    TYSdk.event.on('robot_receive_mapStateChange', handle);

    timeCheck = setInterval(() => {
      if (new Date().getTime() - nowTime >= timeOut) {
        logger.info('等待oss数据超时，取消等待');
        TYSdk.event.remove('robot_receive_mapStateChange', handle);
        clearInterval(timeCheck);
        resolve(false);
      }
    });
  });
}

export function memorize<T>(fn: Function, resolve?: (...params: any[]) => any) {
  const toStr = Object.prototype.toString;
  const isFunction = (fn: any) => {
    return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
  };
  const isAsyncFunction = (fn: any) => {
    return typeof fn === 'function' && toStr.call(fn) === '[object AsyncFunction]';
  };

  const isValid = (value: any) => typeof value !== 'undefined';

  if (!isFunction(fn)) {
    throw new TypeError('memorize: when provided, the first argument must be a function');
  }
  const cache: { [index: string]: any } = {};

  function result(...args: any) {
    if (args.length < 1) {
      throw new TypeError('memorize: arguments cannot be null or undefined');
    }
    const key = resolve
      ? resolve(...args)
      : args.length === 1
        ? `${args[0]}`
        : JSON.stringify(args);
    cache[key] = (isValid(cache[key]) && cache[key]) || fn.apply(fn, args);

    return cache[key] as T;
  }

  if (isAsyncFunction(fn)) {
    return async function (...args: any) {
      return result(...args);
    };
  }

  return result;
}

export function createJsonError(message: string, data: string) {
  return new Error(JSON.stringify({ message, data }));
}

export function getClassSingletonInstance<T>(ClassObj: any, ...params: any[]) {
  const name = '__instance__';
  if (ClassObj[name]) {
    return ClassObj[name] as T;
  }
  ClassObj[name] = new ClassObj(...params);

  return ClassObj[name] as T;
}

export function CoastTime(fn: (...args: any[]) => any, key: string) {
  return (...args) => {
    const startTime = new Date();
    const res = fn(...args);
    const endTime = new Date();
    console.log(`coastTime-${key}`, endTime - startTime);
    return res;
  };
}

export function isNumber(obj) {
  return typeof obj === 'number' && !isNaN(obj);
}

export function getType(obj: any) {
  const type = Object.prototype.toString
    .call(obj)
    .match(/^\[object (.*)\]$/)[1]
    .toLowerCase();
  if (type === 'string' && typeof obj === 'object') return 'object'; // Let "new String('')" return 'object'
  if (obj === null) return 'null'; // PhantomJS has type "DOMWindow" for null
  if (obj === undefined) return 'undefined'; // PhantomJS has type "DOMWindow" for undefined
  return type;
}

export default {
  handleError,
  sequencePromise,
  createSingleton,
  awaitExpectDpsState,
  awaitExpectMapStoreState,
  memorize,
  CoastTime,
};

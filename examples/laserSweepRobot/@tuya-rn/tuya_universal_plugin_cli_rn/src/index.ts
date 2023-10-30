/* eslint-disable no-param-reassign */
import { NativeModules, NativeEventEmitter, Platform, DeviceEventEmitter } from 'react-native';

let Event = {};

const compareVersion: (v1: string, v2: string) => false | 1 | -1 | 0 = (v1, v2) => {
  if (typeof v1 !== 'string') return false;
  if (typeof v2 !== 'string') return false;
  const newV1 = v1.split('.');
  const newV2 = v2.split('.');
  const k = Math.min(newV1.length, newV2.length);
  for (let i = 0; i < k; ++i) {
    const res1 = parseInt(newV1[i], 10);
    const res2 = parseInt(newV2[i], 10);
    if (res1 > res2) return 1;
    if (res1 < res2) return -1;
  }
  return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
};

export function isJSON(args: any): boolean {
  return (
    typeof args === 'string' && !args.indexOf('{') && args.lastIndexOf('}') === args.length - 1
  );
}

export function isSupportTTT(): boolean {
  return NativeModules && NativeModules.TYRCTPBTBridgeManager;
}

export function reducerResult(
  res?: string | Record<string, any>
): string | Record<string, any> | undefined {
  const result = isJSON(res) ? JSON.parse(res as string) : res;
  const { data, errorMsg, errorCode, ...rest } = result;
  if (errorCode !== 0) {
    return { errorMsg, errorCode, ...rest };
  }
  return data;
}

export function reducerCallback(
  callback: {
    success?: ((arg?: string | Record<string, any>) => void) | null;
    fail?: ((arg?: string | Record<string, any>) => void) | null;
    complete?: ((arg?: string | Record<string, any>) => void) | null;
  } = {
    success: null,
    fail: null,
    complete: null,
  }
): any {
  const { success = null, fail = null, complete = null } = callback;

  const completeFail = (args: string | Record<string, any>) => {
    if (fail) {
      fail(reducerResult(args));
      complete && complete(reducerResult(args));
    }
  };

  const completeSuccess = (args: string | Record<string, any>) => {
    if (success) {
      success(reducerResult(args));
      complete && complete(reducerResult(args));
    }
  };

  return { completeSuccess, completeFail };
}

export const omit: (object: Record<string, unknown>, keys: string[]) => Record<string, unknown> = (
  object,
  keys
) => {
  const shallowCopy = {
    ...object,
  };
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    delete shallowCopy[key];
  }
  return shallowCopy;
};

// 方法
export function rnRequestMethod(
  moduleName: string,
  funName: string,
  params: Record<string, any>,
  meta: {
    available: string;
    platform: string;
    container: string;
    deprecated: string;
    hasSync: string | boolean;
    className: string;
  }
): void | Promise<any> {
  try {
    const { success = null, fail = null, complete = null, ...noCallbackParams } = params;
    const { completeSuccess, completeFail } = reducerCallback({ success, fail, complete });
    const { hasSync = false, className = '' } = meta;
    const classNameParse = JSON.parse(className);

    let callClassName = classNameParse[Platform.OS];
    if (compareVersion('5.65', NativeModules.TYRCTPublicManager.mobileInfo.appRnVersion) === -1) {
      if (Platform.OS === 'ios') {
        callClassName = callClassName.replace('TYUni', 'TUNI');
        callClassName = callClassName.replace(/TY/g, 'Thing');
        callClassName = callClassName.replace(/Tuya/g, 'Thing');
      } else {
        callClassName = callClassName.replace(/.tuya./, '.thingclips.');
        callClassName = callClassName.replace(/tyuni/g, 'tuni');
        callClassName = callClassName.replace(/TY/g, 'Thing');
        callClassName = callClassName.replace(/Tuya/g, 'Thing');
      }
      moduleName = moduleName.replace(/TYUni/g, 'TUNI');
      funName = funName.replace(/TY/g, '');
    }

    const hasParams = noCallbackParams.noParams
      ? null
      : JSON.stringify({ data: { ...noCallbackParams }, className: callClassName });
    if (typeof hasSync === 'boolean' && !!hasSync) {
      funName = funName.replace(/Sync/g, '');
      return new Promise((resolve, reject) => {
        NativeModules.TYRCTPBTBridgeManager.universalApi(
          moduleName,
          funName,
          hasParams,
          (resultData: string | Record<string, any>) => {
            resolve(reducerResult(resultData));
          },
          (errorData: string | Record<string, any>) => {
            resolve(reducerResult(errorData));
          }
        );
      });
    }
    return NativeModules.TYRCTPBTBridgeManager.universalApi(
      moduleName,
      funName,
      hasParams,
      completeSuccess,
      completeFail
    );
  } catch (error) {
    console.log(`${moduleName}.${funName} request error!`, error);
    throw error;
  }
}

const eventEmitter = isSupportTTT()
  ? new NativeEventEmitter(NativeModules.TYRCTPBTBridgeManager)
  : null;

eventEmitter &&
  eventEmitter.addListener('eventHandler', body => {
    const { data, eventName: resEventName } = body;
    const result = isJSON(data) ? JSON.parse(data) : data;
    DeviceEventEmitter.emit(resEventName, result);
  });

// 事件
export function rnRequestEvent(
  moduleName: string,
  eventName: string,
  functionName: string,
  callback: (params?: any) => void
): void {
  if (compareVersion('5.65', NativeModules.TYRCTPublicManager.mobileInfo.appRnVersion) === -1) {
    moduleName = moduleName.replace(/TYUni/g, 'TUNI');
    eventName = eventName.replace(/TY/g, '');
  }

  if (functionName && functionName.startsWith('on')) {
    Event[eventName] = DeviceEventEmitter.addListener(`${moduleName}.${eventName}`, data => {
      typeof callback === 'function' && callback(data);
    });
  }
  if (functionName && functionName.startsWith('off')) {
    Event && Event[eventName] && Event[eventName].remove();
    Event = omit(Event, [eventName]);
    typeof callback === 'function' && callback();
  }
}

// registerEvent

export function rnRegisterEvent(
  moduleName: string,
  eventName: string,
  funName: string,
  params: Record<string, any>,
  meta: {
    available: string;
    platform: string;
    container: string;
    deprecated: string;
    hasSync: string | boolean;
    className: string;
  },
  callback: (params?: any) => void
): void {
  if (compareVersion('5.65', NativeModules.TYRCTPublicManager.mobileInfo.appRnVersion) === -1) {
    moduleName = moduleName.replace(/TYUni/g, 'TUNI');
    eventName = eventName.replace(/TY/g, '');
    funName = funName.replace(/TY/g, '');
  }

  if (funName.startsWith('on')) {
    if (!Event[eventName]) {
      rnRequestMethod(
        moduleName,
        funName,
        {
          ...params,
          success: () => {
            Event[eventName] = DeviceEventEmitter.addListener(
              `${moduleName}.${eventName}`,
              data => {
                typeof callback === 'function' && callback(data);
              }
            );
          },
          fail: failRes => {
            typeof callback === 'function' && callback(reducerResult(failRes));
          },
        },
        meta
      );
    } else {
      Event[eventName] = DeviceEventEmitter.addListener(`${moduleName}.${eventName}`, data => {
        typeof callback === 'function' && callback(data);
      });
    }
  }
  if (funName.startsWith('off')) {
    rnRequestMethod(moduleName, funName, params, meta);
    Event && Event[eventName] && Event[eventName].remove();
    Event = omit(Event, [eventName]);
    typeof callback === 'function' && callback();
  }
}

export const getConstants = (): Record<string, any> => {
  if (isSupportTTT()) {
    const { constants } = NativeModules.TYRCTPBTBridgeManager;
    return isJSON(constants) ? JSON.parse(constants) : constants;
  }
  return {};
};

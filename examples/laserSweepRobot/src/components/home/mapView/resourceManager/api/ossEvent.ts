import { IOSSCallback } from '../interface';
import { AppDeviceEventEmitter, TYLaserManager } from './nativeApi';
import { updateAuthentication } from './ossApi';

export enum OSSMapType {
  map = 0,
  path = 1,
  incrementPath = 2,
  planPath = 3,
}

const createSubscription = (callback: (value: string) => void, type: OSSMapType) => {
  const handle = (params: IOSSCallback) => {
    const { mapPath, mapType } = params;
    if (mapType === type) {
      callback && callback(mapPath);
    }
  };
  TYLaserManager.startConnectSweeperDataChannel();
  AppDeviceEventEmitter.addListener('laserMqttEventData', handle);

  return () => {
    TYLaserManager.stopConnectSweeperDataChannel();
    AppDeviceEventEmitter.removeListener('laserMqttEventData', handle);
  };
};

/**
 * 获取地图订阅
 * @param callback
 */
export const createMapSubscription = (callback: (value: string) => void) => {
  return createSubscription(callback, OSSMapType.map);
};

/**
 * 获取扫地机轨迹订阅
 * @param callback
 */
export const createPathSubscription = (callback: (value: string) => void) => {
  return createSubscription(callback, OSSMapType.path);
};

/**
 * 获取扫地机增量轨迹订阅
 * @param callback
 */
export const createIncrementPathSubscription = (callback: (value: string) => void) => {
  return createSubscription(callback, OSSMapType.incrementPath);
};

/**
 * 获取扫地机规划轨迹订阅
 * @param callback
 */
export const createPlanPathSubscription = (callback: (value: string) => void) => {
  return createSubscription(callback, OSSMapType.planPath);
};

/**
 * 订阅自动更新鉴权
 * @param callback
 */
export const createAutoUpdateAuthentication = (
  opts: { period?: number; devId: string },
  callback: (value: string) => void
) => {
  const hour = 1000 * 60 * 10;
  const { period = hour, devId } = opts || {};
  updateAuthentication(devId).then(bucket => {
    callback && callback(bucket);
  });
  const timer = setInterval(() => {
    updateAuthentication(devId).then(bucket => {
      callback && callback(bucket);
    });
  }, period);

  return () => {
    timer && clearInterval(timer);
  };
};

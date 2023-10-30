/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import sweeperP2pInstance from './sweeperP2p';
import ossApiInstance from './ossApi';

export enum P2pMapType {
  map = 0,
  path = 1,
  incrementPath = 2,
  planPath = 3,
}
/**
 * 获取地图订阅，p2p方案
 * @param callback
 */
export const createMapP2pSubscription = (callback: (value: string) => void) => {
  return sweeperP2pInstance.createP2pSubscription(callback, P2pMapType.map);
};

/**
 * 获取扫地机轨迹订阅，p2p方案
 * @param callback
 */
export const createPathP2pSubscription = (callback: (value: string) => void) => {
  return sweeperP2pInstance.createP2pSubscription(callback, P2pMapType.path);
};

/**
 * 获取扫地机增量轨迹订阅，p2p方案
 * @param callback
 */
export const createIncrementPathP2pSubscription = (callback: (value: string) => void) => {
  return sweeperP2pInstance.createP2pSubscription(callback, P2pMapType.incrementPath);
};

/**
 * 获取扫地机规划轨迹订阅，p2p方案
 * @param callback
 */
export const createPlanPathP2pSubscription = (callback: (value: string) => void) => {
  return sweeperP2pInstance.createP2pSubscription(callback, P2pMapType.planPath);
};

export const createAutoUpdateAuthentication = (opts, callback) => {
  const hour = 1000 * 60 * 10;
  const { period = hour, devId } = opts || {};
  ossApiInstance.updateAuthentication(devId).then(bucket => {
    callback && callback(bucket);
  });
  const timer = setInterval(() => {
    ossApiInstance.updateAuthentication(devId).then(bucket => {
      callback && callback(bucket);
    });
  }, period);
  return () => {
    timer && clearInterval(timer);
  };
};

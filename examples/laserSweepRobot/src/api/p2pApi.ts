import { NativeModules } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';

// 引出扫地机p2p 实例
const { TYRCTTransferManager } = NativeModules;

const isSupportP2pSDK = () => {
  return !!TYRCTTransferManager && TYRCTTransferManager.initP2PSDK;
};

/**
 * 初始化扫地机P2P SDK
 */
const initRobotP2pSDK = () => {
  if (isSupportP2pSDK()) {
    return new Promise<void>((resolve, reject) => {
      TYRCTTransferManager.initP2PSDK(TYSdk.devInfo.devId);
      resolve();
    });
  }
  return Promise.reject(new Error('not support p2p'));
};

/**
 * p2p连接设备
 * @returns
 */
const connectDeviceByP2P = () => {
  if (isSupportP2pSDK()) {
    return TYRCTTransferManager.connectDeviceByP2P(TYSdk.devInfo.devId);
  }
  return Promise.reject(new Error('not support p2p'));
};

/**
 * p2p开始获取扫地机文件。
 * @params downloadType 0: 下载完毕关闭连接 1: 持续下载
 * @returns
 */
const startObserverSweeperDataByP2P = (downloadType: number) => {
  if (isSupportP2pSDK()) {
    TYRCTTransferManager.startObserverSweeperDataByP2P(TYSdk.devInfo.devId, downloadType)
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .then(() => {})
      .catch(e => {
        console.log('startObserverSweeperDataByP2P error\n', e);
      });
  }
};

/**
 * p2p取消下载
 * @returns
 */
const stopObserverSweeperDataByP2P = () => {
  if (isSupportP2pSDK()) {
    return TYRCTTransferManager.stopObserverSweeperDataByP2P();
  }
};

/**
 * p2p销毁SDK
 * @returns
 */
const deInitP2pSDK = () => {
  if (isSupportP2pSDK()) {
    TYRCTTransferManager.deInitP2PSDK(TYSdk.devInfo.devId);
  }
};

const P2pAPI = {
  isSupportP2pSDK,
  initRobotP2pSDK,
  connectDeviceByP2P,
  startObserverSweeperDataByP2P,
  stopObserverSweeperDataByP2P,
  deInitP2pSDK,
};

export default P2pAPI;

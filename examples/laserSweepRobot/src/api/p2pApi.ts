import { NativeModules } from 'react-native';
import { TYSdk, Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import { AppDeviceEventEmitter } from '../components/home/mapView/resourceManager/api/nativeApi';
// 引出扫地机p2p 实例
const { TYRCTTransferManager } = NativeModules;

const { isIos } = Utils.RatioUtils;

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

/**
 * 连接设备失败后自动重连
 * @param successCb
 */
const reconnectDeviceByP2P = () => {
  console.log('reconnectDeviceByP2P');
  // p2p连接设备
  connectDeviceByP2P()
    .then(() => {
      console.log('reconnectDeviceByP2P success');
      // 取消下载文件
      stopObserverSweeperDataByP2P()
        .then(() => {
          console.log('stopObserverSweeperDataByP2P success');
          // 开始下载文件
          startObserverSweeperDataByP2P(1);
        })
        .catch(() => {
          console.log('stopObserverSweeperDataByP2P failed');
          // 开始下载文件
          startObserverSweeperDataByP2P(1);
        });
    })
    .catch((err: any) => {
      console.log('reconnectDeviceByP2P error\n', err);
      // 再次重连
      reconnectDeviceByP2P();
    });
};

/**
 * 设备断开链接后的重连操作
 * @returns
 */
const onP2PError = () => {
  const handle = () => {
    console.log('onP2PError');
    // p2p重连
    reconnectDeviceByP2P();
  };
  // 添加p2p断开连接监听
  AppDeviceEventEmitter.addListener('onP2PError', handle);

  return () => {
    AppDeviceEventEmitter.removeListener('onP2PError', handle);
  };
};

/**
 * 是否支持p2p重连
 * ios版本小于4.2.0不支持,其余版本都支持
 * android所有版本都支持
 */
const isSupportReconnectP2P = () => {
  // 如果是ios且版本小于4.2.0,则走旧的app p2p逻辑
  // 否则走新的app p2p逻辑
  if (isIos) {
    return false;
  }
  return true;
};

const P2pAPI = {
  isSupportP2pSDK,
  isSupportReconnectP2P,
  initRobotP2pSDK,
  connectDeviceByP2P,
  reconnectDeviceByP2P,
  startObserverSweeperDataByP2P,
  stopObserverSweeperDataByP2P,
  deInitP2pSDK,
  onP2PError,
};

export default P2pAPI;

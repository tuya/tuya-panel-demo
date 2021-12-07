import { NativeModules, DeviceEventEmitter, NativeAppEventEmitter, Platform } from 'react-native';
import { FileType } from '../interface';

/**
 * 原生事件方法
 */
export const AppDeviceEventEmitter = Platform.select({
  ios: () => NativeAppEventEmitter,
  android: () => DeviceEventEmitter,
})();

/**
 * 面板manager
 */
export const TYDeviceDevice = NativeModules.TYRCTDeviceModule || NativeModules.TYRCTPanelManager;

/**
 * 激光原生Manager方法
 */
export const TYLaserManager = NativeModules.TYRCTLaserManager || {};
// export const TYRCTTypeMapManager = NativeModules.TYRCTTypeMapManager;

/**
 * xml请求方法
 * @param url
 * @param fileType
 */
export const xmlRequest = (url: string, fileType: FileType): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xmlRequest = new XMLHttpRequest();
    xmlRequest.timeout = 10000;
    xmlRequest.open('GET', url, true);
    xmlRequest.responseType = fileType; // 这里是关键，它指明返回的数据的类型是二进制
    xmlRequest.onreadystatechange = () => {
      if (xmlRequest.readyState === 4) {
        if (xmlRequest.status === 200) {
          resolve(xmlRequest._response);
        } else {
          reject(new Error(xmlRequest.status));
        }
      }
    };
    xmlRequest.ontimeout = (e: Error) => {
      reject(
        new Error(
          `status: ${xmlRequest.status} \nreadyState: ${xmlRequest.readyState} \nerror: ${e} `
        )
      );
    };
    xmlRequest.send(null);
  });
};

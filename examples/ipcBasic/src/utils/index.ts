/* eslint-disable import/prefer-default-export */
import { TYSdk } from 'tuya-panel-kit';
import { TYIpcNative } from '@tuya/tuya-panel-ipc-sdk';
import { global } from '@config';
import Strings from '../i18n';

const TYNative = TYSdk.native;
// 请求超时通用接口处理
// timeOutTime 为自己设定的超时秒数
export const cancelRequestTimeOut = () => {
  TYNative.hideLoading();
  clearTimeout(global.requestTimeOut);
};

export const requestTimeout = (timeOutTime = 10000) => {
  global.requestTimeOut = setTimeout(() => {
    TYNative.hideLoading();
    TYIpcNative.showToast(Strings.getLang('requestTimeOutErr'));
  }, timeOutTime);
};
export const getDeviceCloudData = (key: any) => {
  return new Promise((resolve, reject) => {
    TYNative.getDevProperty(
      d => {
        if (typeof d !== 'undefined') {
          let data = d;
          if (key) {
            data = typeof d[key] !== 'undefined' ? d[key] : {};
          }
          if (typeof data === 'string') data = JSON.parse(data);
          resolve(data);
        } else reject();
      },
      err => reject(err)
    );
  });
};

export const saveDeviceCloudData = (key: any, data: any) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = typeof data === 'object' ? JSON.stringify(data) : data;
      TYNative.setDevProperty(key, jsonString, resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
};

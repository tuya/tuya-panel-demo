import { Platform, NativeModules } from 'react-native';
import { TYSdk, GlobalToast, Notification } from 'tuya-panel-kit';
import _get from 'lodash/get';
import Strings from '@i18n';

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? DeepPartial<T[K]> : T[K];
};
export const bleManager = NativeModules.TYRCTBLEManager;
export const panelManager = NativeModules.TYRCTPanelManager;
export const navManager = NativeModules.TYRCTNavManager;

export const hideIconToast = (title = '') => {
  GlobalToast.show({
    text: title,
    showIcon: false,
    onFinish: () => {
      GlobalToast.hide();
    },
  });
};

let flag = true;

export const reConnectBle = (countdown = 11, successToast = true): Promise<boolean> => {
  // 如果设备离线，则在面板内自动触发一次蓝牙连接
  const { devId, deviceOnline } = TYSdk.devInfo;
  const isIOS = Platform.OS === 'ios';
  return new Promise((resolve, reject) => {
    if (!deviceOnline && flag) {
      let timer: any = null,
        time = countdown;
      flag = false;
      timer = setInterval(() => {
        time--;
        Notification.show({
          theme: {
            warningIcon: 'black',
          },
          message: Strings.formatValue('connectBle', time.toString()),
          enableClose: false,
          autoCloseTime: countdown * 1000,
        });
        bleManager.startConnectBleDevice(devId);
        bleManager.getBLEOnlineState(devId, (res: any) => {
          const result = isIOS ? res.state : res;
          if (deviceOnline || result) {
            flag = true;
            clearInterval(timer);
            Notification.hide();
            successToast && hideIconToast(Strings.getLang('bleConnectSuccess'))
            resolve(true);
          }
        });
        if (time === 1 && flag === false) {
          flag = true;
          clearInterval(timer);
          hideIconToast(Strings.getLang('bleConnectFailed'));
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(false);
        }
      }, 1000);
    }
  });
};

// 类似于AsyncStorage.getItem
export const getDeviceCloudData = (key: any) => {
  return new Promise((resolve, reject) => {
    TYSdk.native.getDevProperty((d: any) => {
      if (typeof d !== 'undefined') {
        let data = d;
        if (key) {
          data = typeof d[key] !== 'undefined' ? d[key] : {};
        }
        if (typeof data === 'string') data = JSON.parse(data);
        resolve(data);
      } else reject();
    }, reject);
  });
};

// 类似于AsyncStorage.setItem
export const saveDeviceCloudData = (key: string, data: any) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = typeof data === 'object' ? JSON.stringify(data) : data;
      TYSdk.native.setDevProperty(key, jsonString, resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
};

import { TYSdk } from 'tuya-panel-kit';

const TYNative = TYSdk.native;

TYNative.getDeviceCloudData = key => {
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
        } else {
          reject(new Error('get Data Failure'));
        }
      },
      () => {
        reject(new Error('get Data Failure'));
      }
    );
  });
};

TYNative.saveDeviceCloudData = (key, data) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = typeof data === 'object' ? JSON.stringify(data) : data;
      TYNative.setDevProperty(key, jsonString, resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
};

export default TYNative;

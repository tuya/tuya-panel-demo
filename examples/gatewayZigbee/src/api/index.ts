import { TYSdk } from 'tuya-panel-kit';

export const getSubDevice = () => {
  return new Promise((resolve, reject) => {
    TYSdk.native.getSubDeviceList(
      {
        devId: TYSdk.devInfo.devId,
      },
      resolve,
      reject
    );
  });
};

export const getDeviceLists = () => {
  return new Promise((resolve, reject) => {
    TYSdk.native.getDeviceList(resolve, reject);
  });
};

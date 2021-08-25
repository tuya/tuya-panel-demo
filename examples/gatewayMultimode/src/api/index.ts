import { TYSdk } from 'tuya-panel-kit';

// 获取网关下的子设备列表
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

// 获取家庭下的设备列表
export const getDeviceLists = () => {
  return new Promise((resolve, reject) => {
    TYSdk.native.getDeviceList(resolve, reject);
  });
};

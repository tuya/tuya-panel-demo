import { TYSdk } from 'tuya-panel-kit';

interface PostData {
  [key: string]: any;
}
interface AddBleSubDev {
  uuid: string;
  devId: string;
}

const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';

const api = (a: string, postData: PostData, v = '1.0') => {
  return new Promise((resolve, reject) => {
    TYSdk.apiRequest(a, postData, v)
      .then((d: any) => {
        const data = typeof d === 'string' ? JSON.parse(d) : d;
        __DEV__ && console.log(`API Success: %c${a}%o`, sucStyle, postData, data);
        resolve(data);
      })
      .catch((err: any) => {
        const e = typeof err === 'string' ? JSON.parse(err) : err;
        __DEV__ &&
          console.log(`API Failed: %c${a}%o`, errStyle, postData, e.message || e.errorMsg || e);
        reject(err);
      });
  });
};
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

// 蓝牙子设备的添加和删除
export const bleSubDevChange = (
  sourceMeshId: string,
  nodes: AddBleSubDev[],
  targetMeshId: string | null
) => {
  return api('tuya.m.device.relation.update.for.ble', { sourceMeshId, nodes, targetMeshId }, '2.0');
};

// SIG Mesh子设备的添加和删除
export const sigmeshSubDevChange = (
  sourceMeshId: string,
  nodeIds: string[],
  targetMeshId: string
) => {
  return api('tuya.m.device.relation.update', { sourceMeshId, nodeIds, targetMeshId }, '2.0');
};

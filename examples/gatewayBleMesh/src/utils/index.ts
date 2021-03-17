/* eslint-disable import/prefer-default-export */
import { Utils, TYSdk } from 'tuya-panel-kit';

const { getBitValue } = Utils.NumberUtils;

// 判断是否为SIG Mesh子设备
export const isSigMesh = capability => !!getBitValue(capability, 15) && !getBitValue(capability, 1);

// 判断是否为SIG Mesh网关设备
export const isSigMeshGateway = capability => !!getBitValue(capability, 15);

// 判断是否为蓝牙子设备
const isBlueSub = capability =>
  !!getBitValue(capability, 10) && !getBitValue(capability, 15) && !getBitValue(capability, 12);

// 判断是否为红外设备
const isInfrared = capability => !!getBitValue(capability, 13);

// 判断子设备是否在线
export const getOnlineState = (value = '') => {
  const pcc = `${value}`;
  if (pcc === '') return false;
  if (pcc.length > 1) {
    const _head = pcc[0];
    const _footer = pcc[pcc.length - 1];
    return ['05', '50'].includes(`${_head}${_footer}`);
  }
  return false;
};

// 过滤子设备
export const getSubDev = data => {
  const { devId: id, sigmeshId } = TYSdk.devInfo;
  const arr = data.filter(({ capability = 0, devId, meshId }) => {
    // 非红外设备及当前网关设备
    if (devId !== id && !isInfrared(capability)) {
      // SIG Mesh设备
      if (isSigMesh(capability)) {
        return meshId === sigmeshId && meshId !== id;
      }
      // 蓝牙设备
      if (isBlueSub(capability)) {
        if (!meshId) {
          return true;
        }
        return meshId === sigmeshId && meshId !== id;
      }
      return false;
    }
    return false;
  });
  return arr.map(item => ({
    ...item,
    meshId: item.meshId || '',
    isSigMesh: isSigMesh(item.capability),
  }));
};

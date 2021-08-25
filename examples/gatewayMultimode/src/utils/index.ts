/* eslint-disable import/prefer-default-export */
import { TYSdk, Utils } from 'tuya-panel-kit';

const { getBitValue } = Utils.NumberUtils;

// 判断是否为蓝牙设备
export const isBluetooth = capability =>
  !!getBitValue(capability, 10) &&
  !getBitValue(capability, 15) &&
  !getBitValue(capability, 12) &&
  // 过滤掉具有wifi蓝牙双模的子设备
  !getBitValue(capability, 1);

// 判断是否为zigbee设备
export const isZigbee = capability => !!getBitValue(capability, 12);

// 判断是否为红外设备
export const isInfrared = capability => !!getBitValue(capability, 13);

// 判断是否为SIG Mesh网关设备
export const isSigMeshGateway = capability => !!getBitValue(capability, 15);

// 判断是否为SIG Mesh子设备
// eslint-disable-next-line no-bitwise
export const isSigMesh = capability => capability & (1 << 15) && (capability & 1) !== 1;

// 获取子设备在线状态
export const getOnlineState = (target = '') => {
  const pcc = `${target}`;
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
      if (isBluetooth(capability)) {
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

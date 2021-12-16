import { TYSdk } from 'tuya-panel-kit';
/**
 * 用户获取设备自身的激活时间(配网时间)
 * @param  {String} devId 设备id
 */
export const getDeviceActiveDate = () => {
  const { devId } = TYSdk.devInfo;
  return TYSdk.apiRequest('tuya.m.device.active.date', { devId });
};

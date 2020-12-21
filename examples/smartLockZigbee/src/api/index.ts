import { TYSdk } from 'tuya-panel-kit';
import dpCode from '../config/dpCodes';

// let apiRequestHandle: { [key: string]: (...args: any[]) => Promise<any> } = {};
export const getAlarmList = (offset: number, limit: number) => {
  const data = [TYSdk.device.getDpIdByCode(dpCode.alarmLock)];
  console.log(data);
  return TYSdk.apiRequest<any>(
    'tuya.m.device.lock.alarm.list',
    {
      devId: TYSdk.devInfo.devId,
      dpIds: data,
      offset,
      limit,
      includeHijack: false,
    },
    '2.0'
  );
};

export const getOpenList = (limit: number, offset: number, dpIds: string[]) => {
  return TYSdk.apiRequest<any>(
    'tuya.m.scale.history.list',
    {
      devId: TYSdk.devInfo.devId,
      offset,
      limit,
      dpIds,
      startTime: 0,
      endTime: 0,
    },
    '2.0'
  );
};

export const getUserInfo = () => {
  return TYSdk.apiRequest<any>(
    'tuya.m.device.member.panel.get',
    {
      devId: TYSdk.devInfo.devId,
      userId: '',
    },
    '1.0'
  );
};

export const remoteOpen = (way: 'open' | 'close') => {
  return TYSdk.apiRequest<any>(
    'tuya.m.zigbee.lock.remotepwd.execute',
    {
      devId: TYSdk.devInfo.devId,
      open: way === 'open',
    },
    '1.0'
  );
};

export const fetchDp = (param: string) => {
  return TYSdk.apiRequest<any>(
    'tuya.m.device.props.fetch',
    {
      devId: TYSdk.devInfo.devId,
      props: param,
    },
    '1.0'
  );
};
export const fetchDpSave = (param: any) => {
  return TYSdk.apiRequest<any>(
    'tuya.m.device.props.save',
    {
      devId: TYSdk.devInfo.devId,
      propKvs: JSON.stringify(param),
    },
    '1.0'
  );
};
export const getUnReadNum = () => {
  return TYSdk.apiRequest<any>(
    'tuya.m.device.lock.alarm.unread',
    {
      devId: TYSdk.devInfo.devId,
    },
    '1.0'
  );
};
export default {
  getOpenList,
  getAlarmList,
  getUserInfo,
  remoteOpen,
  fetchDp,
  fetchDpSave,
  getUnReadNum,
};

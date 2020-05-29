import { TYSdk } from 'tuya-panel-kit';
import { store } from '../main';

const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;

const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';

const api = function(a, postData, v = '1.0') {
  return new Promise((resolve, reject) => {
    TYNative.apiRequest(
      {
        a,
        postData,
        v,
      },
      d => {
        const data = typeof d === 'string' ? JSON.parse(d) : d;
        console.log(`API Success: %c${a}%o`, sucStyle, data);
        resolve(data);
      },
      err => {
        const e = typeof err === 'string' ? JSON.parse(err) : err;
        console.log(`API Failed: %c${a}%o`, errStyle, postData, e.message || e.errorMsg || e);
        reject(err);
      }
    );
  });
};

export const getDpsInfos = () => {
  const { devInfo = {} } = store.getState();
  const key = devInfo.groupId ? 'group' : 'device';
  const nameMap = {
    device: 's.m.dev.dp.get',
    group: 's.m.dev.group.dp.get',
  };
  const postDataMap = {
    device: {
      gwId: devInfo.devId,
      devId: devInfo.devId,
    },
    group: { groupId: devInfo.groupId },
  };
  const versionMap = {
    device: '2.0',
    group: '1.0',
  };
  return api(nameMap[key], postDataMap[key], versionMap[key]);
};

/**
 * 更新设备dp点名称
 * @param {string} dpCode
 * @param {string} name
 */
export const updateDpNames = (dpCode: string, name: string) => {
  const { devInfo = {} } = store.getState();
  const key = devInfo.groupId ? 'group' : 'device';
  const nameMap = {
    device: 's.m.dev.dp.name.update',
    group: 'tuya.m.group.dpname.update',
  };
  const postDataMap = {
    device: {
      gwId: devInfo.devId,
      devId: devInfo.devId,
      dpId: TYDevice.getDpIdByCode(dpCode),
      name,
    },
    group: {
      groupId: devInfo.groupId,
      dpId: +TYDevice.getDpIdByCode(dpCode),
      name,
    },
  };
  return api(nameMap[key], postDataMap[key], '1.0');
};

/**
 * 批量获取多个DP点最近的定时
 * @param {Array} dpIds            [description]
 * @return {[type]}                 [description]
 */
export const getLastTimers = function(dpCodes) {
  const { devInfo = {} } = store.getState();
  const { devId, groupId } = devInfo;
  const dpIds = dpCodes.map(code => TYDevice.getDpIdByCode(code)).join(',');
  const postDataMap = {
    device: {
      type: 'device',
      bizId: devId,
      instruct: JSON.stringify({ devId, dpIds }),
    },
    group: {
      type: 'device_group',
      bizId: devId,
      instruct: JSON.stringify({ groupId, dpIds }),
    },
  };
  const key = devInfo.groupId ? 'group' : 'device';
  return api('s.m.linkage.timer.nearest.bat.get', postDataMap[key]);
};

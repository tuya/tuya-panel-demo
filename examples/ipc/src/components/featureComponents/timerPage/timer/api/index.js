/* eslint-disable max-len */
/* eslint-disable camelcase */
import { TYSdk, Utils } from 'tuya-panel-kit';
import { store } from '../../../../../main';

const utils_1 = require('../utils');

const { TimeUtils, JSONUtils } = Utils;

const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';

const api = (a, postData, v = '1.0') => {
  return TYSdk.apiRequest({
    a,
    postData,
    v,
  })
    .then(d => {
      const data = typeof d === 'string' ? JSONUtils.parseJSON(d) : d;
      console.log(`API Success: %c${a}%o`, sucStyle, data);
      return data;
    })
    .catch(err => {
      const e = typeof err === 'string' ? JSONUtils.parseJSON(err) : err;
      console.log(`API Failed: %c${a}%o`, errStyle, e.message || e.errorMsg || e, postData);
      return err;
    });
};
/**
 * 添加定时
 * 支持群组定时
 */
exports.addTimer = params => {
  const state = store.getState();
  const { groupId: devGroupId, devId } = state.devInfo;
  const defaultParams = {
    bizId: devGroupId || devId,
    bizType: devGroupId ? 1 : 0,
    timeZone: TimeUtils.timezone(),
    isAppPush: false,
    actionType: devGroupId ? 'device_group' : 'device',
    options: {},
  };
  const postData = Object.assign(Object.assign({}, defaultParams), params);
  return api('tuya.m.timer.group.add', { ...postData }, '4.0');
};
/**
 * 更新定时
 * 支持群组定时
 */
exports.updateTimer = params => {
  const state = store.getState();
  const { groupId: devGroupId, devId } = state.devInfo;
  const defaultParams = {
    bizId: devGroupId || devId,
    bizType: devGroupId ? 1 : 0,
    timeZone: TimeUtils.timezone(),
    isAppPush: false,
    actionType: devGroupId ? 'device_group' : 'device',
    options: {},
  };
  const postData = Object.assign(Object.assign({}, defaultParams), params);
  return api('tuya.m.timer.group.update', { ...postData }, '4.0');
};

// 定时是否支持开启执行通知
exports.checkIsSupportNotice = () => {
  const state = store.getState();
  const { groupId: devGroupId, devId } = state.devInfo;
  const bizType = devGroupId ? 1 : 0;
  return api(
    'tuya.m.timer.support.notice',
    {
      bizId: devGroupId || devId,
      bizType,
    },
    '2.0'
  );
};

// 获取定时列表
exports.getCategoryTimerList = category => {
  const state = store.getState();
  const { groupId: devGroupId, devId } = state.devInfo;
  const type = devGroupId ? 'device_group' : 'device';
  return api(
    'tuya.m.timer.group.list',
    {
      bizId: devGroupId || devId,
      type,
      category,
    },
    '2.0'
  );
};

exports.updateStatus = (category, groupId, status, devInfo) => {
  const state = store.getState();
  const { groupId: devGroupId, devId } = devInfo || state.devInfo;
  return api(
    'tuya.m.timer.group.status.update',
    {
      type: devGroupId ? 'device_group' : 'device',
      bizId: devGroupId || devId,
      category,
      groupId,
      status,
    },
    '2.0'
  );
};

/**
 * [removeTimer description]
 * @param {[type]} groupId  [description]
 * @param {[type]} category [description]
 * @param {Object} devInfo [设备信息]
 * @return {[type]}          [description]
 * 删除定时
 * 支持群组定时
 */
exports.removeTimer = (groupId, category, devInfo) => {
  const state = store.getState();
  const { groupId: devGroupId, devId } = devInfo || state.devInfo;
  return api(
    'tuya.m.timer.group.remove',
    {
      type: devGroupId ? 'device_group' : 'device',
      bizId: devGroupId || devId,
      groupId,
      category,
    },
    '2.0'
  );
};

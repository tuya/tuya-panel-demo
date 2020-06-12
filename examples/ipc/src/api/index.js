import { TYSdk, Utils } from 'tuya-panel-kit';
import moment from 'moment';
import { timezone } from '../utils';
import { store } from '../main';

const TYNative = TYSdk.native;
const JSONUtils = Utils.JsonUtils;
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

// 消息中心

TYSdk.getMsgList = (devId, offset) => {
  const endFormat = moment(new Date()).format('YYYY-MM-DD 23:59:59');
  const endDate = moment(endFormat).valueOf() / 1000;
  return api(
    'tuya.m.msg.list.by.json',
    {
      json: {
        msgSrcId: devId,
        msgType: '4', // 固定传4
        limit: 20,
        offset,
        startTime: '946656000', // 2000年
        endTime: endDate,
      },
    },
    '1.0'
  );
};
// 获取预设点列表
TYSdk.getMemoryPointList = devId => {
  return api(
    'tuya.m.ipc.memory.point.list',
    {
      devId,
    },
    '1.0'
  );
};
// 修改预设点列表
TYSdk.updateMemoryPointList = (devId, id, name) => {
  return api(
    'tuya.m.ipc.memory.point.rename',
    {
      devId,
      id,
      name,
    },
    '1.0'
  );
};

TYSdk.getDeviceCloudData = key => {
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
        } else reject();
      },
      err => reject(err)
    );
  });
};

TYSdk.saveDeviceCloudData = (key, data) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = typeof data === 'object' ? JSON.stringify(data) : data;
      TYNative.setDevProperty(key, jsonString, resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
};

// 云存储部分
// 1. 获取云存储状态
TYSdk.getServiceStatus = (pid, uuid) => {
  return api(
    'tuya.customer.instance.served.check',
    {
      clientId: pid,
      instanceId: uuid,
    },
    '1.0'
  );
};

/**
 * 按天获取存储统计信息
 */
TYSdk.getStorageByDay = devId => {
  return api(
    'tuya.m.ipc.storage.info.day.count',
    {
      devId,
      timeZone: timezone(),
    },
    '1.0'
  );
};

/**
 * 获取云存储事件列表
 */
TYSdk.queryCloudEventList = (startTime, endTime, offset, devId) => {
  return api(
    'tuya.m.ipc.storage.event.timerange.query',
    {
      devId,
      timeGT: startTime,
      timeLT: endTime,
      offset,
      limit: 30,
    },
    '1.0'
  );
};

/**
 * 获取云存储购买的域名Url
 */
TYSdk.getDomainUrl = () => {
  return api(
    'tuya.ia.app.domain.query',
    {
      bizCode: 'cloud_camera_store',
    },
    '1.0'
  );
};

/**
 * 获取统计数据
 * @param {*} startTime
 */

// 获取一天中的数据
TYSdk.queryHourData = (dpId, date) => {
  const state = store.getState();
  const { devId } = state.devInfo;
  return api(
    'tuya.m.dp.rang.stat.hour.list',
    {
      dpId,
      devId,
      date,
      number: 1,
      type: 'sum',
    },
    '1.0'
  );
};

// 按天统计数据
TYSdk.queryDayData = (dpId, startDay, endDay) => {
  const state = store.getState();
  const { devId } = state.devInfo;
  return api(
    'tuya.m.dp.rang.stat.day.list',
    {
      dpId,
      devId,
      startDay,
      endDay,
      type: 'sum',
    },
    '1.0'
  );
};

/**
 * @desc
 *   hookRoute 可以做一些控制处理，
 *   return 是一个 Object, 返回出去的Object将会被 FullView 所应用，
 *   FullView 即一个视图包裹组件，内置了头部栏，背景，离线提示，模态窗等功能，
 *   因此你可以通过return的object来自定义这些内容;
 * @param bizId: 	设备Id/设备群组id  bizType: 	0:设备；1:设备群组 category: 'sds'  status: 更新后的状态
 * @example
 * bizId: 	设备Id/设备群组id
 * bizId: 	设备Id/设备群组id
 */

TYSdk.removeTimerCategoryData = (bizId, category) => {
  return api(
    'tuya.m.timer.category.remove',
    {
      bizId,
      bizType: 0,
      category,
    },
    '1.0'
  );
};

export default TYSdk;

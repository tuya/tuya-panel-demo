import { TYSdk, Utils } from 'tuya-panel-kit';
import { parseJSON } from '@utils';
import _ from 'lodash';
const { TimeUtils } = Utils;

/**
 * 添加定时
 * 支持群组定时
 */
const addTimer = (params: any) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = TYSdk.devInfo;
    const defaultParams = {
      bizId: devGroupId || devId,
      bizType: devGroupId ? 1 : 0,
      timeZone: TimeUtils.timezone(),
      isAppPush: false,
      actionType: devGroupId ? 'device_group' : 'device',
      options: {},
    };
    const postData = { ...defaultParams, ...params };
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.add',
        postData,
        v: '4.0',
      },
      (d: any) => {
        const data = parseJSON(d);
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

/**
 * 更新定时
 * 支持群组定时
 */
const updateTimer = (params: any) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = TYSdk.devInfo;
    const defaultParams = {
      bizId: devGroupId || devId,
      bizType: devGroupId ? 1 : 0,
      timeZone: TimeUtils.timezone(),
      isAppPush: false,
      actionType: devGroupId ? 'device_group' : 'device',
      options: {},
    };
    const postData = { ...defaultParams, ...params };
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.update',
        postData,
        v: '4.0',
      },
      (d: any) => {
        const data = parseJSON(d);
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

export const getDpsWithDevId = _.throttle((dpIds: any) => {
  return new Promise((resolve, reject) => {
    TYSdk.native.getDpDataFromMeshDevice({ dpIds }, (e: any) => {
      console.log(`e`, e);
      reject(e);
    });
  });
}, 500);

const updateTimerStatus = (category: string, groupId: string, status: boolean, devInfo?: any) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = devInfo || TYSdk.devInfo;
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.status.update',
        postData: {
          type: devGroupId ? 'device_group' : 'device',
          bizId: devGroupId || devId,
          category,
          groupId,
          status,
        },
        v: '2.0',
      },
      (d: any) => {
        const data = parseJSON(d);
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
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
const removeTimer = (groupId: string, category: string, devInfo?: any) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = devInfo || TYSdk.devInfo;

    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.remove',
        postData: {
          type: devGroupId ? 'device_group' : 'device',
          bizId: devGroupId || devId,
          groupId,
          category,
        },
        v: '2.0',
      },
      (d: any) => {
        const data = parseJSON(d);
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

/**
 * [getCategoryTimerList description]
 * @param  {[type]} category [description]
 * @return {[type]}          [description]
 * 获取某个分类下的定时
 * 支持群组定时
 */
const getCategoryTimerList = (category: string) => {
  return new Promise((resolve, reject) => {
    const { groupId, devId } = TYSdk.devInfo;
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.list',
        postData: {
          type: groupId ? 'device_group' : 'device',
          bizId: groupId || devId,
          category,
        },
        v: '2.0',
      },
      (d: any) => {
        const data = parseJSON(d);
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

export default {
  addTimer,
  updateTimer,
  updateTimerStatus,
  removeTimer,
  getCategoryTimerList,
};
import { avgSplit, sort } from '@utils';

const { native: TYNative } = TYSdk;
const { timezone } = Utils.TimeUtils;

export const api = TYSdk.apiRequest.bind(TYSdk);

const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';

function request(Request, version = '1.0', postData) {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest(
      {
        a: Request,
        postData,
        v: version,
      },
      d => {
        const data = typeof d === 'string' ? JSON.parse(d) : d;
        console.log(`Request Success: %c${Request}%o`, sucStyle, data);
        resolve(data);
      },
      err => {
        const e = typeof err === 'string' ? JSON.parse(err) : err;
        console.log(`Request Failed: %c${Request}%o`, errStyle, e.message || e.errorMsg || e);
        reject(err);
      }
    );
  });
}

export const getDeviceCloudData = (key?: string) => {
  return new Promise((resolve, reject) => {
    TYNative.getDevProperty(d => {
      console.log('getDevProperty1', d);
      if (typeof d !== 'undefined') {
        let data = d;
        // 单独处理灯串
        if (key && !['lights', 'scenes'].includes(key)) {
          data = typeof d[key] !== 'undefined' ? d[key] : {};
        } else {
          const lightsSliceIndexArr: number[] = [];
          const sceneIdArr: number[] = [];
          data = Object.keys(d).reduce((acc, cur) => {
            if (cur.includes('sys_env')) return acc; // 数据里会注入一个embed_sys_env属性，原因不明
            if (cur.startsWith('lights_')) {
              lightsSliceIndexArr.push(+cur.slice('lights_'.length));
            } else if (cur.startsWith('scene_')) {
              sceneIdArr.push(+cur.slice('scene_'.length));
            } else {
              acc[cur] = d[cur];
            }
            return acc;
          }, {});
          if (lightsSliceIndexArr.length) {
            const lights = avgSplit(
              sort(lightsSliceIndexArr).reduce((acc, cur) => acc + d[`lights_${cur}`], ''),
              20
            );
            if (key) data = lights;
            else data.lights = lights;
          }
          if (sceneIdArr.length) {
            const scenes = sort(sceneIdArr).reduce((acc, cur) => {
              const dt = d[`scene_${cur}`];
              if (dt) acc.push(JSON.parse(dt));
              return acc;
            }, []);
            if (key) data = scenes;
            else data.scenes = scenes;
          }
        }
        if (typeof data === 'string') data = JSON.parse(data);
        resolve(data);
      } else reject();
    }, reject);
  });
};

export const saveDeviceCloudData = (key: string, data: any) => {
  return new Promise((resolve, reject) => {
    try {
      if (!data) reject();
      const jsonString = typeof data === 'object' ? JSON.stringify(data) : data;
      // console.log('setDevProperty', key, jsonString);
      TYNative.setDevProperty(key, jsonString, resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
};

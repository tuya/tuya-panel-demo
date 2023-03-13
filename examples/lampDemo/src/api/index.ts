/* eslint-disable no-useless-catch */

import { TYSdk, Utils } from 'tuya-panel-kit';
import { avgSplit, sort, parseJSON } from '@utils';

const { native: TYNative } = TYSdk;
const { timezone } = Utils.TimeUtils;

export const getOssUrl = () => {
  return TYSdk.apiRequest<string>('tuya.m.app.panel.url.get', {});
};

export const api = TYSdk.apiRequest.bind(TYSdk);

const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';

function request(Request: string, version = '1.0', postData: any) {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest(
      {
        a: Request,
        postData,
        v: version,
      },
      (d: any) => {
        const data = typeof d === 'string' ? JSON.parse(d) : d;
        console.log(`Request Success: %c${Request}%o`, sucStyle, data);
        resolve(data);
      },
      (err: any) => {
        const e = typeof err === 'string' ? JSON.parse(err) : err;
        console.log(`Request Failed: %c${Request}%o`, errStyle, e.message || e.errorMsg || e);
        reject(err);
      }
    );
  });
}

export const getDeviceCloudData = (key?: string) => {
  return new Promise((resolve, reject) => {
    TYNative.getDevProperty((d: any) => {
      console.log('getDevProperty1', d);
      if (typeof d !== 'undefined') {
        let data = d;
        // 单独处理灯串
        if (key && !['lights', 'scenes'].includes(key)) {
          data = typeof d[key] !== 'undefined' ? d[key] : {};
        } else {
          const lightsSliceIndexArr: number[] = [];
          const sceneIdArr: number[] = [];
          data = Object.keys(d).reduce((acc: any, cur) => {
            if (cur.includes('sys_env')) return acc; // 数据里会注入一个embed_sys_env属性，原因不明
            if (cur.startsWith('lights_')) {
              lightsSliceIndexArr.push(+cur.slice('lights_'.length));
            } else if (cur.startsWith('whiteLights_')) {
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
            const scenes = sort(sceneIdArr).reduce((acc: any[], cur) => {
              const dt = d[`scene_${cur}`];
              if (dt) acc.push(JSON.parse(dt));
              return acc;
            }, []);
            if (key) data = scenes;
            else data.scenes = scenes;
          }
        }
        console.log('getDevProperty2', data);
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
/**
 * 删除云端数据by key
 * @param  {...String} codes 多个删除字段
 * @return { Boolean } 删除成功返回true，如果数据库不存在删除数据，返回false throw false。
 */
export async function deleteDeviceCloudData(...codes: string[]) {
  try {
    const result: any = await request('s.m.dev.property.delete', '1.0', {
      devId: TYSdk.devInfo.devId,
      codeList: JSON.stringify(codes),
    });
    if (result) {
      return result;
    }
    throw new Error(result);
  } catch (error) {
    throw error;
  }
}

/**
 * [addTimer description]
 * @param {[type]} category [description]
 * @param {[type]} loops    [description]
 * @param {[type]} instruct [description]
 * @param {Object} devInfo [设备信息]
 * 添加定时
 * 支持群组定时
 */
export const addTimer = (
  category: string,
  loops: string,
  instruct: string,
  devInfo = TYSdk.devInfo
) => {
  return new Promise((resolve, reject) => {
    const { groupId, devId } = devInfo;
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.add',
        postData: {
          type: groupId ? 'device_group' : 'device',
          bizId: groupId || devId,
          timeZone: timezone(),
          category,
          loops,
          instruct,
        },
        v: '3.0',
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
 * [updateTimer description]
 * @param {[type]} groupId  [群组id]
 * @param {[type]} category [定时类型]
 * @param {[type]} loops    [循环]
 * @param {[type]} instruct [自定义定时内容]
 * @param {Object} devInfo [设备信息]
 * @return {[type]}          [description]
 * 更新定时
 * 支持群组定时
 */
export const updateTimer = (
  groupId: string,
  category: string,
  loops: string,
  instruct: string,
  devInfo = TYSdk.devInfo
) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = devInfo;
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.update',
        postData: {
          type: devGroupId ? 'device_group' : 'device',
          bizId: devGroupId || devId,
          timeZone: timezone(),
          loops,
          category,
          instruct,
          groupId,
        },
        v: '3.0',
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
 * [updateStatus description]
 * @param {[type]} category [description]
 * @param {[type]} groupId  [description]
 * @param {[type]} status   [description]
 * @param {Object} devInfo [设备信息]
 * @return {[type]}          [description]
 * 更新某个组定时的状态
 * 支持群组定时
 */
export const updateTimerStatus = (
  status: string,
  category: string,
  groupId: string,
  devInfo: any
) => {
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
export const removeTimer = (groupId: string, category: string, devInfo: any) => {
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
 * @param {Object} devInfo [设备信息]
 * @return {[type]}          [description]
 * 获取某个分类下的定时
 * 支持群组定时
 */
export const getCategoryTimerList = (category: string, devInfo = TYSdk.devInfo) => {
  return new Promise((resolve, reject) => {
    const { groupId, devId } = devInfo;
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
        const data = parseJSON(d) || [];
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

/* eslint-disable no-useless-catch */

import { TYSdk, Utils } from 'tuya-panel-kit';
import { avgSplit, sort, parseJSON } from '@utils';

const { native: TYNative } = TYSdk;
const { timezone } = Utils.TimeUtils;

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
// Obtain cloud data
export const getDeviceCloudData = (key?: string) => {
  return new Promise((resolve, reject) => {
    TYNative.getDevProperty((d: any) => {
      if (typeof d !== 'undefined') {
        let data = d;
        // Handle the string of lights separately
        if (key && !['lights', 'scenes'].includes(key)) {
          data = typeof d[key] !== 'undefined' ? d[key] : {};
        } else {
          const lightsSliceIndexArr: number[] = [];
          const sceneIdArr: number[] = [];
          data = Object.keys(d).reduce((acc: any, cur) => {
            if (cur.includes('sys_env')) return acc; // The data will be injected with an embed_sys_env attribute for unknown reasons
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
      TYNative.setDevProperty(key, jsonString, resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
};
/**
 * Delete cloud data by key
 * @param  {...String} codes Multiple deleted fields
 * @return { Boolean } Return true on success, or false throw false if the database does not have deleted dat.
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
 * @param {Object} devInfo [Device information]
 * Add timing
 * Support group timing
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
 * @param {[type]} groupId  [Group id]
 * @param {[type]} category [Timing type]
 * @param {[type]} loops    [cycle]
 * @param {[type]} instruct [Customize timing content]
 * @param {Object} devInfo [Device information]
 * @return {[type]}          [description]
 * Update timing
 * Support group timing
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
 * @param {Object} devInfo [Device information]
 * @return {[type]}          [description]
 * Updates the status of a group timing
 * Support group timing
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
 * @param {Object} devInfo [Device information]
 * @return {[type]}          [description]
 * Deletion timing
 * Support group timing
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
 * @param {Object} devInfo [Device information]
 * @return {[type]}          [description]
 * Get the scheduled tasks under a certain category.
 * Support group scheduling.
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

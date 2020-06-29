import { TYSdk } from 'tuya-panel-kit';
import { Platform } from 'react-native';
import { store } from '../main';

const TYNative = TYSdk.native;

export const executeSense = (ruleId: string) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest(
      {
        a: 'tuya.m.linkage.rule.trigger',
        postData: {
          ruleId,
        },
        v: '1.0',
      },
      (d: any) => {
        const data = Platform.OS === 'android' ? JSON.parse(d) : d;
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

const api = function(a: string, postData: any, v = '1.0') {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest(
      {
        a,
        postData,
        v,
      },
      (d: any) => {
        const data = typeof d === 'string' ? JSON.parse(d) : d;
        resolve(data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
};

// 查询场景面板设备绑定的场景列表
export const getSceneData = () => {
  const { devInfo = {} }: any = store.getState();
  const { devId } = devInfo;
  return api('tuya.m.linkage.rule.bind.wifi.query', { devId });
};

// 查询场景面板设备可以绑定的场景列表
export const getCouldBindData = () => {
  const { devInfo = {} }: any = store.getState();
  const { devId }: any = devInfo;
  return api('tuya.m.linkage.rule.brief.query', { devId }, '1.0');
};

/**
 * 绑定场景
 * @param {string} devId
 * @param {number} btnId
 * @param {string} ruleId
 * @param {number} dpId
 * @param {string} dpValue
 */
export const bindScene = (postData: any) => {
  return api('tuya.m.linkage.rule.bind.wifi.save', { ...postData });
};

/**
 * 解除绑定场景
 * @param {string} devId
 * @param {number} btnId
 */
export const removeBindData = (btnId: number) => {
  const { devInfo = {} }: any = store.getState();
  const { devId } = devInfo;
  return api('tuya.m.linkage.rule.bind.wifi.remove', { devId, btnId });
};

export const deviceIsWifi = (capability: number) => {
  return capability === 1;
};

export const getBitValue = (num: number, index: number) => {
  return (num & (1 << index)) >> index;
};

export const isZigBeeDevice = (capability: number) => {
  return getBitValue(capability, 12) === 1;
};

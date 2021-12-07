import { Utils, TYSdk } from 'tuya-panel-kit';

export const getMultipleMapFiles = () => {
  return new Promise<any>((resolve, reject) => {
    TYSdk.apiRequest(
      'tuya.m.dev.common.file.list',
      {
        devId: TYSdk.devInfo.devId,
        fileType: 'collect_recode',
        offset: 0,
        limit: 5,
      },
      '1.0'
    )
      .then((d: string) => resolve(Utils.JsonUtils.parseJSON(d)))
      .catch(reject);
  });
};

/**
 * 获取语音列表
 */
export const getVoiceList = () => {
  return new Promise<any>((resolve, reject) => {
    TYSdk.apiRequest(
      'tuya.m.product.voice.list',
      {
        deviceId: TYSdk.devInfo.devId,
        offset: 0,
        limit: 10,
      },
      '2.0'
    )
      .then((d: string) => resolve(Utils.JsonUtils.parseJSON(d)))
      .catch(reject);
  });
};

import { TYSdk } from 'tuya-panel-kit';
import Base64 from 'base64-js';
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import { Interface, Api } from '../../resourceManager';
import TuyaProtocol from '../../../../../protocol';
import { IStore, ImapData } from '../interface';
import Utils from '../../../../../protocol/utils';

const { logger } = Utils;

// 实时地图获取最新一次地图-任务
const realTimeFirstMap: Interface.ITask = {
  action: async (store: IStore, nextData: any) => {
    const url = await Api.OSSAPI.getCloudFileUrl(store.bucket, nextData);
    logger.success('首张地图文件url链接', url);
    const nextMap: ImapData = await RNFetchBlob.fetch('GET', url, {}).then(res => {
      const { status } = res.respInfo;
      if (status === 200) {
        const base64Str = res.base64();
        const bytes = Base64.toByteArray(base64Str);
        const data = _(bytes)
          .map(d => _.padStart(d.toString(16), 2, '0'))
          .value()
          .join('');
        const next = TuyaProtocol.map.decode(data);
        return next;
      }
    });
    return _.omitBy({ ...nextMap }, _.isNil);
  },
  source: (store: IStore, next) => {
    let timer: number;
    const handle = () => {
      if (store.bucket && !store.mapData) {
        // 已经鉴权且没有存在地图，需要获取第一次数据
        Api.OSSAPI.getLatestMapFile(TYSdk.devInfo.devId).then(({ mapPath }) => {
          timer && clearTimeout(timer);
          next(mapPath);
        });
      } else {
        // 3s后再尝试
        timer && clearTimeout(timer);
        timer = setTimeout(handle, 100);
      }
    };
    handle();
    return () => {
      timer && clearTimeout(timer);
    };
  },
};

export default realTimeFirstMap;

import Base64 from 'base64-js';
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import TuyaProtocol from '../../../../../protocol';
import { Interface, Api } from '../../resourceManager';
import { IStore, IProps } from '../interface';
import Utils from '../../../../../protocol/utils';

const { logger } = Utils;

// 实时地图任务
const realTimeMap: Interface.ITask = {
  action: async (store: IStore, nextData: any, elementProps: IProps) => {
    const url = await Api.OSSAPI.getCloudFileUrl(store.bucket, nextData);
    logger.success('实时地图文件url链接', url);
    const nextMap = await RNFetchBlob.fetch('GET', url, {}).then(res => {
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
    const handleUrl = async (path: string) => {
      next(path);
    };
    const unsubscribe = Api.OSSEvent.createMapSubscription(handleUrl);
    return unsubscribe;
  },
};

export default realTimeMap;

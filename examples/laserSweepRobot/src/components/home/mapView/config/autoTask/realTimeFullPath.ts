import Base64 from 'base64-js';
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import TuyaProtocol from '../../../../../protocol';
import { Interface, Api } from '../../resourceManager';
import { IStore, IPathData } from '../interface';
import Utils from '../../../../../protocol/utils';

const { logger } = Utils;

// 实时扫地机全量轨迹
const realTimeFullPath: Interface.ITask = {
  action: async (store: IStore, nextData: any) => {
    // 已经鉴权，可以获取完整地址
    const url = await Api.OSSAPI.getCloudFileUrl(store.bucket, nextData);
    logger.success('实时全量路径文件url链接', url);
    const nextPath: IPathData = await RNFetchBlob.fetch('GET', url, {}).then(res => {
      const { status } = res.respInfo;
      if (status === 200) {
        const base64Str = res.base64();
        const bytes = Base64.toByteArray(base64Str);
        const data = _(bytes)
          .map(d => _.padStart(d.toString(16), 2, '0'))
          .value()
          .join('');
        const next = TuyaProtocol.path.decode(data);
        return next;
      }
    });

    return _.omitBy(
      {
        ...nextPath,
        pathId: nextPath.id,
      },
      _.isNil
    );
  },
  source: (store: IStore, next) => {
    const handleUrl = async (path: string) => {
      if (store.bucket && store.mapData) {
        next(path);
      }
    };
    const unsubscribe = Api.OSSEvent.createPathSubscription(handleUrl);
    return unsubscribe;
  },
};

export default realTimeFullPath;

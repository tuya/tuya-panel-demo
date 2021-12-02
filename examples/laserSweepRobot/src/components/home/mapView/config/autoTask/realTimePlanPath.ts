import _omitBy from 'lodash/omitBy';
import Base64 from 'base64-js';
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import TuyaProtocol from '../../../../../protocol';
import { Interface, Api } from '../../resourceManager';
import { IStore } from '../interface';
import Utils from '../../../../../protocol/utils';

const { logger } = Utils;

// 实时扫地机全量轨迹
const realTimeFullPath: Interface.ITask = {
  action: async (store: IStore, nextData: any) => {
    // 已经鉴权，可以获取完整地址
    const url = await Api.OSSAPI.getCloudFileUrl(store.bucket, nextData);
    logger.success('导航路径文件url链接', url);
    const nextPath = await RNFetchBlob.fetch('GET', url, {}).then(res => {
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

    if (nextPath.pathData && !nextPath.pathData.length) return;
    if (store.pathData && store.pathData.length) {
      // 如果已经存在路径，判断是否需要累加还是覆盖
      const accumulatePath = TuyaProtocol.path.accumulatePath(
        {
          pathId: store.pathId,
          totalCount: store.totalCount,
          pathData: store.pathData,
          forceUpdate: store.forceUpdate,
          type: store.type,
          startCount: store.startCount,
          isFull: store.isFull,
        },
        nextPath
      );

      return _.omitBy(
        {
          planPathData: accumulatePath.pathData,
        },
        _.isNil
      );
    }
  },
  source: (store: IStore, next) => {
    const handleUrl = async (path: string) => {
      if (store.bucket && store.mapData) {
        next(path);
      }
    };
    const unsubscribe = Api.OSSEvent.createPlanPathSubscription(handleUrl);
    return unsubscribe;
  },
};

export default realTimeFullPath;

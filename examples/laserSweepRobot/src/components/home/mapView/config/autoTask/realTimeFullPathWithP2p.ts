import _ from 'lodash';
import TuyaProtocol, { protocolUtil } from '@protocol';
import { IStore } from '../interface';
import { Interface, Api } from '../../resourceManager';

const { logger } = protocolUtil;

// 实时扫地机全量轨迹
const realTimeFullPathWithP2p: Interface.ITask = {
  action: async (store: IStore, nextData: any) => {
    // 已经鉴权，可以获取完整地址
    logger.success('实时全量路径数据', nextData);
    const nextPath: any = TuyaProtocol.path.decode(nextData);
    return _.omitBy(
      {
        ...nextPath,
        pathId: nextPath.id,
      },
      _.isNil
    );
  },
  source: (store: IStore, next) => {
    const handleData = async (path: string) => {
      next(path);
    };
    const unsubscribe = Api.OSSEvent.createPathP2pSubscription(handleData);
    return unsubscribe;
  },
};

export default realTimeFullPathWithP2p;

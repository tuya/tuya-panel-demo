import _ from 'lodash';
import TuyaProtocol, { protocolUtil } from '@protocol';
import { P2pEvent } from '@api';
import { IStore } from '../interface';
import { Interface, Api } from '../../resourceManager';

const { logger } = protocolUtil;

// 实时扫地机全量轨迹
const realTimeOriginFullPathWithP2p: Interface.ITask = {
  action: async (store: IStore, nextData: any) => {
    // 已经鉴权，可以获取完整地址
    logger.success('实时全量路径数据', nextData);
    return { originPathData: nextData };
  },
  source: (store: IStore, next) => {
    const handleData = async (path: string) => {
      next(path);
    };
    const unsubscribe = P2pEvent.createPathP2pSubscription(handleData);
    return unsubscribe;
  },
};

export default realTimeOriginFullPathWithP2p;

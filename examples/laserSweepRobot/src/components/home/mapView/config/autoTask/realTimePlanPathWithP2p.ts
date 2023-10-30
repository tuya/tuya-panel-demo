import _ from 'lodash';
import TuyaProtocol, { protocolUtil } from '@protocol';
import { IStore } from '../interface';
import { Interface, Api } from '../../resourceManager';
import { P2pEvent } from '@api';

const { logger } = protocolUtil;

// 实时扫地机全量轨迹
const realTimePlanPathWithP2p: Interface.ITask = {
  action: async (store: IStore, nextData: any) => {
    // 已经鉴权，可以获取完整地址
    logger.success('导航路径数据', nextData);
    const nextPath: any = TuyaProtocol.path.decode(nextData);
    return _.omitBy(
      {
        planPathData: nextPath.pathData,
      },
      _.isNil
    );
  },
  source: (store: IStore, next) => {
    const handleData = async (data: string) => {
      next(data);
    };
    const unsubscribe = P2pEvent.createPlanPathP2pSubscription(handleData);
    return unsubscribe;
  },
};

export default realTimePlanPathWithP2p;

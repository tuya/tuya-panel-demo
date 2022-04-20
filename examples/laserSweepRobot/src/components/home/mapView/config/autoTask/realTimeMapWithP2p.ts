import _ from 'lodash';
import TuyaProtocol, { protocolUtil } from '@protocol';
import { IStore, IProps } from '../interface';
import { Interface, Api } from '../../resourceManager';

const { logger } = protocolUtil;

// 实时地图任务
const realTimeMapWithP2p: Interface.ITask = {
  action: async (store: IStore, nextData: any, elementProps: IProps) => {
    const {
      laserMapPanelConfig: { mapConfig },
    } = elementProps;
    logger.success('地图数据', nextData);
    const nextMap: any = TuyaProtocol.map.decode(nextData, mapConfig);
    return _.omitBy({ ...nextMap }, _.isNil);
  },
  source: (store: IStore, next) => {
    const handleData = async (map: string) => {
      next(map);
    };
    const unsubscribe = Api.OSSEvent.createMapP2pSubscription(handleData);
    return unsubscribe;
  },
};

export default realTimeMapWithP2p;

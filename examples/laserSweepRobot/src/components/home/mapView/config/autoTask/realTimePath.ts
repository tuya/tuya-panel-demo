import { TYSdk } from 'tuya-panel-kit';
import Base64 from 'base64-js';
import _ from 'lodash';
import { Interface, Api } from '../../resourceManager';
import TuyaProtocol from '../../../../../protocol';
import Utils from '../../../../../protocol/utils';

import { IDpData, IProps, IStore } from '../interface';

const { atHexToString } = Utils.StringsUtils;

// 实时扫地机全量轨迹
const realTimeFullPath: Interface.ITask = {
  action: async (store: IStore, nextData: any) => {
    // 已经鉴权，可以获取完整地址
    const fullUrl = await Api.OSSAPI.getCloudFileUrl(store.bucket, nextData);
    const res = await Api.NativeAPI.xmlRequest(fullUrl, 'blob');
    const bytes = Base64.toByteArray(res);
    const data = _(bytes)
      .map(d => _.padStart(d.toString(16), 2, '0'))
      .value()
      .join('');
    const nextPath = await TuyaProtocol.path.decode(data);

    if (nextPath.pathData && !nextPath.pathData.length) return;
    if (store.pathData && store.pathData.length) {
      // 如果已经存在路径，判断是否需要累加还是覆盖
      const accumulatePath = TuyaProtocol.path.accumulatePath(
        {
          id: store.pathId,
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
          ...accumulatePath,
        },
        _.isNil
      );
    }
    return _.omitBy(
      {
        ...nextPath,
        pathId: nextPath.id,
      },
      _.isNil
    );
  },
  source: (store: IStore, next, elementConfig: IProps) => {
    const { DPCodes } = elementConfig;
    const handle = (data: IDpData) => {
      const { type, payload } = data;

      const pathData = payload[DPCodes.pathData];
      if (type === 'dpData' && pathData && store.bucket && store.mapData) {
        next(atHexToString(pathData));
      }
    };
    TYSdk.event.on('deviceDataChange', handle);
    return () => {
      TYSdk.event.remove('deviceDataChange', handle);
    };
  },
};

export default realTimeFullPath;

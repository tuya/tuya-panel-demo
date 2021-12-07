import { TYSdk } from 'tuya-panel-kit';
import Base64 from 'base64-js';
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import { Interface, Api } from '../../resourceManager';
import TuyaProtocol from '../../../../../protocol';
import { IStore, IProps, IPathData } from '../interface';
import Utils from '../../../../../protocol/utils';

const { logger } = Utils;

// 实时地图获取最新一次扫地机轨迹-任务
const realTimeFirstPath: Interface.ITask = {
  action: async (store: IStore, nextData: any, elementProps: IProps) => {
    // 已经鉴权，可以获取完整地址
    const url = await Api.OSSAPI.getCloudFileUrl(store.bucket, nextData);
    logger.success('首张全量路径文件url链接', url);
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
    if (!nextPath || !nextPath.pathData || !nextPath.pathData.length) return;
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
          ...accumulatePath,
        },
        _.isNil
      );
    }

    return _.omitBy(
      {
        ...nextPath,
        pathId: nextPath.pathId,
      },
      _.isNil
    );
  },
  source: (store: IStore, next) => {
    let timer: number;
    const handle = () => {
      if (store.bucket) {
        // 已经鉴权且已获取地图,需要获取第一次数据
        Api.OSSAPI.getLatestMapFile(TYSdk.devInfo.devId).then(({ routePath }) => {
          timer && clearTimeout(timer);
          next(routePath);
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

export default realTimeFirstPath;

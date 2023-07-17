import _ from 'lodash';
import Base64 from 'base64-js';
import RNFetchBlob from 'rn-fetch-blob';
import { Interface, Api } from '../../resourceManager';
import { IStore, IProps, IHistory } from '../interface';
import TuyaProtocol from '../../../../../protocol';
import Utils from '../../../../../protocol/utils';

const { logger } = Utils;
const { map, path, area } = TuyaProtocol;

// 历史地图-任务
const historyMap: Interface.ITask = {
  action: async (store: IStore, nextData: any, elementProps: IProps) => {
    const {
      history,
      laserMapPanelConfig: { mapConfig },
    } = elementProps;
    if (history && (!history.file || !history.bucket)) return {};
    const { bucket, file, mapLen = 0, pathLen = 0 } = history;
    const url = await Api.OSSAPI.getCloudFileUrl(bucket, file);
    logger.success('清扫记录文件url链接', url);
    const nextMap: IHistory = await RNFetchBlob.fetch('GET', url, {}).then(res => {
      const { status } = res.respInfo;
      if (status === 200) {
        const base64Str = res.base64();
        const bytes = Base64.toByteArray(base64Str);
        const data = _(bytes)
          .map(d => _.padStart(d.toString(16), 2, '0'))
          .value()
          .join('');
        const mapStrLength = mapLen * 2;
        const pathStrLength = pathLen * 2;
        const mapData = data.slice(0, mapStrLength);
        const pathData = data.slice(mapStrLength, mapStrLength + pathStrLength);
        const virtualData = data.slice(mapStrLength + pathStrLength);
        const mapState = map.decode(mapData, mapConfig);
        const pathState = path.decode(pathData);
        const virtualState = area.decode(virtualData);
        return {
          mapState,
          // pathState,
          originPathData: pathData,
          virtualState,
        };
      }
    });
    const { mapState, pathState, originPathData, virtualState } = nextMap;
    return _.omitBy(
      {
        ...mapState,
        // ...pathState,
        originPathData,
        ...virtualState,
      },
      _.isNil
    );
  },
  source: (store: IStore, next) => {
    let timer: number;
    const handle = () => {
      if (store.bucket) {
        next();
      } else {
        timer && clearTimeout(timer);
        timer = setTimeout(handle, 500);
      }
    };
    handle();
    return () => {
      timer && clearTimeout(timer);
    };
  },
};

export default historyMap;

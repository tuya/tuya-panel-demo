import _ from 'lodash';
import Base64 from 'base64-js';
import RNFetchBlob from 'rn-fetch-blob';
import { Interface, Api } from '../../resourceManager';
import { IStore, IProps, IMultiFloor } from '../interface';
import TuyaProtocol from '../../../../../protocol';
import Utils from '../../../../../protocol/utils';

const { logger } = Utils;

const { map, area } = TuyaProtocol;

// 历史地图-任务
const historyMap: Interface.ITask = {
  action: async (store: IStore, nextData: any, elementProps: IProps) => {
    const { history } = elementProps;
    if (history && (!history.file || !history.bucket)) {
      return {};
    }
    const { bucket, file } = history;
    const url = await Api.OSSAPI.getCloudFileUrl(bucket, file);
    logger.success('多地图文件url链接', url);
    const mapData: IMultiFloor = await RNFetchBlob.fetch('GET', url, {}).then(res => {
      const { status } = res.respInfo;
      if (status === 200) {
        const base64Str = res.base64();
        const bytes = Base64.toByteArray(base64Str);
        const data = _(bytes)
          .map(d => _.padStart(d.toString(16), 2, '0'))
          .value()
          .join('');

        const mapState = map.decode(data);
        const {
          mapHeader: { compressAfterLength, bgHeight, bgWidth, originData },
        } = mapState;
        let mapLength = 0;
        if (compressAfterLength) {
          mapLength = originData.length + compressAfterLength * 2;
        } else {
          mapLength = originData.length + bgHeight * bgWidth;
        }
        const virtualData = data.slice(mapLength);
        const virtualState = area.decode(virtualData);
        return {
          mapState,
          virtualState,
        };
      }
    });
    const { mapState, virtualState } = mapData;
    return _.omitBy(
      {
        ...mapState,
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
        // 1s后再尝试
        timer && clearTimeout(timer);
        timer = setTimeout(handle, 1000);
      }
    };
    handle();
    return () => {
      timer && clearTimeout(timer);
    };
  },
};

export default historyMap;

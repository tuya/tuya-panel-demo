import { TYSdk } from 'tuya-panel-kit';
import _omitBy from 'lodash/omitBy';
import _isNil from 'lodash/isNil';
import { Interface } from '../../resourceManager';
import Utils from '../../../../../protocol/utils';
import { isRobotQuiet } from '../../../../../utils/robotStatus';
import Store from '../../../../../store';
import { IProps, IStore } from '../interface';
import { DPCodes } from '../../../../../config';

const { stringToAtHex } = Utils.StringsUtils;
const dpState: any = Store.dpState.data;

// 实时请求扫地机轨迹
const requestPath: Interface.ITask = {
  action: (store: IStore, nextData: any) => {
    const data = {
      cmd: 101,
      data: { startno: store.startCount },
    };
    TYSdk.device.putDeviceData({
      [DPCodes.pathData]: stringToAtHex(JSON.stringify(data)),
      option: 0,
    });

    return {
      startCount: store.startCount,
    };
  },
  source: (store: IStore, next, config: IProps) => {
    const handle = () => {
      const { status } = dpState;
      if (store.mapData && !isRobotQuiet(status)) {
        // 有地图再请求路径
        next(store.startCount);
      }
    };
    const timer = setInterval(handle, 2000);

    return () => {
      timer && clearInterval(timer);
    };
  },
};

export default requestPath;

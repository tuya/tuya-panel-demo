import { TYSdk } from 'tuya-panel-kit';
import _omitBy from 'lodash/omitBy';
import _isNil from 'lodash/isNil';
import { Interface } from '../../resourceManager';
import { isRobotQuiet } from '../../../../../utils/robotStatus';
import Store from '../../../../../store';
import { IProps, IStore } from '../interface';
import { DPCodes } from '../../../../../config';

const dpState: any = Store.dpState.data;

// 定时间隔下发地图请求心跳
const requestMap: Interface.ITask = {
  action: (store: IStore, nextData: any) => {
    TYSdk.device.putDeviceData({ [DPCodes.commFlag]: DPCodes.commonFlagValues.inmap });
    return {};
  },

  source: (store: IStore, next, config: IProps) => {
    const handle = () => {
      const { status } = dpState;
      if (store.mapData && !isRobotQuiet(status)) {
        next();
      }
    };

    const timer = setInterval(handle, 10 * 1000);
    return () => {
      timer && clearInterval(timer);
    };
  },
};

export default requestMap;

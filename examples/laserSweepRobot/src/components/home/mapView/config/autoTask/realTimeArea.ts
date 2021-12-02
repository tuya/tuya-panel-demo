import { TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';
import { Interface } from '../../resourceManager';
import { IDpData, IStore, IProps } from '../interface';
import TuyaProtocol from '../../../../../protocol';

// 实时区域监听
const realTimeArea: Interface.ITask = {
  action: async (store: IStore, nextData: string, elementConfig: IProps) => {
    const cur = TuyaProtocol.area.decode(nextData);
    const {
      appointData,
      sweepRegionData,
      virtualAreaData,
      virtualWallData,
      materialObjData,
      virtualMopAreaData,
    } = store;
    const pre = {
      appointData,
      sweepRegionData,
      virtualAreaData,
      virtualWallData,
      materialObjData,
      virtualMopAreaData,
    };
    if (Object.keys(cur).length > 0) {
      const nextState = _.omitBy({ ...pre, ...cur }, _.isNil) || {};
      return nextState;
    }
  },
  source: (store: IStore, next, elementConfig: IProps) => {
    const { DPCodes } = elementConfig;
    let timer: number;
    const request = () => {
      if (store.mapData) {
        timer && clearTimeout(timer);
        TYSdk.device.putDeviceData({ [DPCodes.commFlag]: DPCodes.commonFlagValues.inmap });
      } else {
        timer && clearTimeout(timer);
        timer = setTimeout(request, 1000);
      }
    };

    const handle = async (data: IDpData) => {
      const { type, payload } = data;
      const commRow: string | number | boolean = payload[DPCodes.commText];
      if (commRow && type === 'dpData') next(commRow);
    };
    TYSdk.event.on('deviceDataChange', handle);

    request();
    return () => {
      TYSdk.event.remove('deviceDataChange', handle);
    };
  },
};

export default realTimeArea;

import { TYSdk } from 'tuya-panel-kit';
import { Interface, Api } from '../../resourceManager';
import { IStore } from '../interface';

const updateAuthentication: Interface.ITask = {
  action: (store: IStore, nextData: string) => {
    return {
      bucket: nextData,
    };
  },
  source: (store: IStore, next) => {
    const handle = (bucket: string) => {
      next(bucket);
    };
    const unsubscribe = Api.OSSEvent.createAutoUpdateAuthentication(
      { devId: TYSdk.devInfo.devId },
      handle
    );
    return unsubscribe;
  },
};

export default updateAuthentication;

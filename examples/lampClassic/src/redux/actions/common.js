import { TYSdk } from 'tuya-panel-kit';
import { updateDp as updateDpState } from '../modules/common';
import * as DpUtils from '../../utils/dpUtils';

// eslint-disable-next-line import/prefer-default-export
export const updateDp = dispatch => data => {
  // 记录下发的模式
  DpUtils.recordDpQuery(data);
  data.work_mode && dispatch(updateDpState(data));
  TYSdk.device.putDeviceData(data);
};

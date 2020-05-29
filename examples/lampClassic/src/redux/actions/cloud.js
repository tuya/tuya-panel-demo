import { updateCloud as updateCloudAction } from '../modules/cloud';
import TYNative from '../../api';

export const updateCloud = dispatch => (key, data) => {
  // 先更新本地store，确保局域网下操作正常
  dispatch(updateCloudAction({ [key]: data }));
  TYNative.saveDeviceCloudData(key, data).then(() => {
    // dispatch(updateCloudAction({ [key]: data }));
  });
};

export const updateStateOnly = dispatch => data => {
  dispatch(updateCloudAction(data));
};

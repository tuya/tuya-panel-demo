import { handleActions, createAction } from 'redux-actions';
import _ from 'lodash';
import { TYSdk } from 'tuya-panel-kit';
import {
  getAllDisplayedDevice,
  getAllHiddenDevice,
  getIsReportRule,
  getDevInstructInfo,
} from '@api';
import { IFormatDeviceItem } from '@interface';
import { isValidDevice, formatDevice } from '@utils';
import { store } from '@models';

const saveDisplayedDeviceList = createAction('SAVE_DISPLAYED_DEVICE_LIST');

const displayedDeviceList = handleActions<IFormatDeviceItem[]>(
  {
    [saveDisplayedDeviceList.toString()]: (_state, action) => action.payload,
  },
  []
);
const saveHiddenDeviceList = createAction('SAVE_HIDDEN_DEVICE_LIST');

const hiddenDeviceList = handleActions<IFormatDeviceItem[]>(
  {
    [saveHiddenDeviceList.toString()]: (_state, action) => action.payload,
  },
  []
);

export const actions = {
  saveDisplayedDeviceList,
  saveHiddenDeviceList,
};

export const reducers = {
  displayedDeviceList,
  hiddenDeviceList,
};

export const getDeviceList = () => async dispatch => {
  try {
    // TYSdk.mobile.showLoading();
    const [isReportRule, displayedList, hiddenList, devInstructList] = await Promise.all([
      getIsReportRule(),
      getAllDisplayedDevice(),
      getAllHiddenDevice(),
      getDevInstructInfo(),
    ]);
    let displayedListRes = displayedList;
    let hiddenListRes = hiddenList;
    // 如果中控设备上报过过滤规则，过滤完全由接口处理，反之则需要自行过滤
    if (!isReportRule) {
      const standPidList = devInstructList
        .filter(d => (d.functionSchemaList.length || d.statusSchemaList.length) > 0)
        .map(d => d.productId);

      displayedListRes = displayedListRes.filter(d => isValidDevice(d, standPidList));
      hiddenListRes = hiddenListRes.filter(d => isValidDevice(d, standPidList));
    }
    const { roomList } = store.getState();
    // 将各项格式化为统一的结构
    (displayedListRes as any) = displayedListRes.map(d => formatDevice(d, roomList));
    (hiddenListRes as any) = hiddenListRes.map(d => formatDevice(d, roomList));

    dispatch(saveDisplayedDeviceList(displayedListRes));
    dispatch(saveHiddenDeviceList(hiddenListRes));

    // TYSdk.mobile.hideLoading();
  } catch (err) {
    // TYSdk.mobile.hideLoading();
    console.log(err);
  }
};

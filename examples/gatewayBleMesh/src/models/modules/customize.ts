import { combineReducers } from 'redux';
import { handleActions, createAction } from 'redux-actions';
import { TYSdk } from 'tuya-panel-kit';

import { getDeviceLists, getSubDevice } from '../../api';
import { SubDevInfo } from '../../config/fetchDataInterface';

export const getRoomInfo = createAction('GETROOMINFO');
export const roomInfo = handleActions(
  {
    [getRoomInfo.toString()]: (_, action) => action.payload,
  },
  []
);

export const saveSubDevList = createAction('SAVESUBDEVLIST');

export const getSubDevList = devId => async dispatch => {
  try {
    const { appRnVersion } = TYSdk.mobile.mobileInfo;
    let lists;
    if (appRnVersion >= '5.14' && appRnVersion <= '5.28') {
      const data = (await getDeviceLists()) as SubDevInfo[];
      lists = data.filter(({ meshId, devId: id }) => meshId === devId && id !== devId);
    } else {
      lists = await getSubDevice();
    }
    if (Array.isArray(lists)) {
      dispatch(saveSubDevList(lists));
    }
  } catch (error) {
    __DEV__ && console.log(error);
  }
};

export const subDevList = handleActions(
  {
    [saveSubDevList.toString()]: (_, action) => action.payload,
  },
  []
);

export const actions = {
  getRoomInfo,
  getSubDevList,
};

const rootReducers = combineReducers({
  subDevList,
  roomInfo,
});

export default rootReducers;

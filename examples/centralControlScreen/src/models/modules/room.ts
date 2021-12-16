import { handleActions, createAction } from 'redux-actions';
import _ from 'lodash';
import { TYSdk } from 'tuya-panel-kit';
import { getRoomLists } from '@api';
import { IRoomItem } from '@interface';

const saveRoomList = createAction('SAVE_ROOM_LIST');

const roomList = handleActions<IRoomItem[]>(
  {
    [saveRoomList.toString()]: (state, action) => action.payload,
  },
  []
);

export const actions = {
  saveRoomList,
};

export const reducers = {
  roomList,
};

export const getRoomList = () => async dispatch => {
  try {
    // TYSdk.mobile.showLoading();
    const list = await getRoomLists();
    await dispatch(saveRoomList(list));
    // TYSdk.mobile.hideLoading();
  } catch (err) {
    // TYSdk.mobile.hideLoading();
    console.log(err);
  }
};

import { combineReducers } from 'redux';
import { handleActions, createAction } from 'redux-actions';
import { getSubDevice } from '@api';

export type Actions = { [K in keyof typeof actions]: ReturnType<typeof actions[K]> };

/**
 * actions
 */

export const getRoomInfo = createAction('GETROOMINFO');

const saveSubDevList = createAction('SAVESUBDEVLIST');

/**
 * reducers
 */

export const roomInfo = handleActions(
  {
    [getRoomInfo.toString()]: (_, action) => action.payload,
  },
  []
);

export const subDevList = handleActions(
  {
    [saveSubDevList.toString()]: (_, action) => action.payload,
  },
  []
);

export const getSubDevList = () => async dispatch => {
  try {
    const lists = await getSubDevice();
    if (Array.isArray(lists)) {
      dispatch(saveSubDevList(lists));
    }
  } catch (error) {
    __DEV__ && console.log(error);
  }
};

export const actions = {
  getRoomInfo,
  getSubDevList,
};

const rootReducers = combineReducers({
  roomInfo,
  subDevList,
});
export default rootReducers;

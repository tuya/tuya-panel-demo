import { combineReducers } from 'redux';
import { handleActions, createAction } from 'redux-actions';

export const getResetTipList = createAction('GETRESETTIPLIST');
export const resetTipList = handleActions(
  {
    [getResetTipList.toString()]: (_, action) => action.payload,
  },
  []
);

export const actions = {
  getResetTipList,
};

const rootReducers = combineReducers({
  resetTipList,
});

export default rootReducers;

import { createAction, handleActions } from 'redux-actions';
import { workState } from './workState';
import { recipes } from './recipes';
import { toastState } from './toast';

// ActionTypes
const DEVINFOCHANGE = '_DEVINFOCHANGE_';
const DEVICECHANGED = '_DEVICECHANGED_';
const INIT_DP = 'INIT_DP';
const UPDATE_DP = 'UPDATE_DP';

// Actions
export const devInfoChange = createAction(DEVINFOCHANGE);
export const deviceChange = createAction(DEVICECHANGED);
export const initDp = createAction(INIT_DP);
export const updateDp = createAction(UPDATE_DP);

// Reducers
const dpState = handleActions(
  {
    [DEVINFOCHANGE]: (state, action) => ({
      ...state,
      ...action.payload.state,
    }),

    [INIT_DP]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [UPDATE_DP]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

const devInfo = handleActions(
  {
    [DEVINFOCHANGE]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [DEVICECHANGED]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

export const reducers = {
  dpState,
  devInfo,
  workState,
  recipes,
  toastState,
};

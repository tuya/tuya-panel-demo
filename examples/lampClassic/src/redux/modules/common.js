import { createAction, handleActions } from 'redux-actions';

// ActionTypes
const DEVINFOCHANGE = '_DEVINFOCHANGE_';
const DEVICECHANGED = '_DEVICECHANGED_';
const INIT_DP = 'INIT_DP';
const UPDATE_DP = 'UPDATE_DP';
const RESPONSE_UPDATE_DP = 'UPDATE_DP';

// Actions
export const devInfoChange = createAction(DEVINFOCHANGE);
export const deviceChange = createAction(DEVICECHANGED);
export const initDp = createAction(INIT_DP);
export const updateDp = createAction(UPDATE_DP);
export const responseUpdateDp = createAction(RESPONSE_UPDATE_DP);

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

    [RESPONSE_UPDATE_DP]: (state, action) => ({
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
};

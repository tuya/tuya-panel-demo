import { handleActions, createAction } from 'redux-actions';

// ActionTypes
const INIT_CLOUD = 'INIT_CLOUD';
const UPDATE_CLOUD = 'UPDATE_CLOUD';

// actions
export const initCloud = createAction(INIT_CLOUD);
export const updateCloud = createAction(UPDATE_CLOUD);

// reducer
const cloudState = handleActions(
  {
    [INIT_CLOUD]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [UPDATE_CLOUD]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

export const reducers = {
  cloudState,
};

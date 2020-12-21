import { createAction, handleActions } from 'redux-actions';

const GETWARNLIST = 'GETWARNLIST';
const GETOPENLIST = 'GETOPENLIST';

const GETWARNLISTONE = 'GETWARNLISTONE';
const GETOPENLISTONE = 'GETOPENLISTONE';

export const getWarnList = createAction(GETWARNLIST);
export const getWarnListOne = createAction(GETWARNLISTONE);

export const getOpenList = createAction(GETOPENLIST);
export const getOpenListOne = createAction(GETOPENLISTONE);

const warnList = handleActions(
  {
    [GETWARNLIST]: (state: any, action) => ({
      ...state,
      ...action.payload,
      list: state.list ? state.list.concat(action.payload.list) : action.payload.list,
    }),
    [GETWARNLISTONE]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

const openList = handleActions(
  {
    [GETOPENLIST]: (state: any, action) => ({
      ...state,
      ...action.payload,
      list: state.list ? state.list.concat(action.payload.list) : action.payload.list,
    }),
    [GETOPENLISTONE]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

export const reducers = {
  warnList,
  openList,
};

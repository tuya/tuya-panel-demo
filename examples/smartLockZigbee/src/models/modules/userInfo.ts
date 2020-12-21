import { createAction, handleActions } from 'redux-actions';

const GETUSER = 'GETUSER';
const SETUSEROPEN = 'SETUSEROPEN';

export const getUser = createAction(GETUSER);

export const setUserOpen = createAction(SETUSEROPEN);

const user = handleActions(
  {
    [GETUSER]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

const userOpenJurisdiction = handleActions(
  {
    [SETUSEROPEN]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

export const reducers = {
  user,
  userOpenJurisdiction,
};

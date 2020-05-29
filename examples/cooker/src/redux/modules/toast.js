import { createAction, handleActions } from 'redux-actions';
import Strings from '../../i18n';

let timer = null;
// ActionTypes
export const UPDATE_TOAST_STATE = 'UPDATE_TOAST_STATE';

// Actions
export const updateToastState = createAction(UPDATE_TOAST_STATE);

export const recipeFetchError = dispatch => {
  dispatch(
    updateToastState({
      state: true,
      info: Strings.getLang('recipe_fetch_error'),
    })
  );
  onToastClose(dispatch);
};

export const resetState = dispatch => {
  dispatch(
    updateToastState({
      state: false,
      info: '',
    })
  );
};

export const toastTrigger = (dispatch, info = {}) => {
  dispatch(updateToastState(info));
  this.onToastClose(dispatch);
};

const onToastClose = dispatch => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    resetState(dispatch);
  }, 2000);
};

export const toastState = handleActions(
  {
    [UPDATE_TOAST_STATE]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {
    info: '',
    state: false,
  }
);

export const reducers = {
  toastState,
};

/* eslint-disable import/no-cycle */
import { createAction, handleActions } from 'redux-actions';
import { store } from './configureStore';

export const actionsType = {
  DEVINFOCHANGE: '_DEVINFOCHANGE_',
  DEVICECHANGED: '_DEVICECHANGED_',
  INIT_DP: 'INIT_DP',
  UPDATE_DP: 'UPDATE_DP',
  UPDATE_OUTDOOR_STATE: 'UPDATE_OUTDOOR_STATE',
};

// actions
export const devInfoChange = createAction(actionsType.DEVINFOCHANGE);
export const deviceChange = createAction(actionsType.DEVICECHANGED);
export const initDp = createAction(actionsType.INIT_DP);
export const updateDp = createAction(actionsType.UPDATE_DP);
export const changeOutdoorState = createAction(actionsType.UPDATE_OUTDOOR_STATE);

const outState = handleActions(
  {
    [actionsType.UPDATE_OUTDOOR_STATE]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {
    outdoorState: {
      temp: '--',
      cityName: '--',
      condTxt: '--',
      pm25: '--',
      quality: '--',
    },
  }
);

export const updateOutdoorState = state => {
  store.dispatch(changeOutdoorState(state));
};

export const reducers = {
  outState,
};

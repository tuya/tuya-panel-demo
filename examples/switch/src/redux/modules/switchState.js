import { TYSdk } from 'tuya-panel-kit';
import { handleActions, createAction } from 'redux-actions';
import { getDpsInfos, updateDpName, getLastTimers } from '../../api';

const TYDevice = TYSdk.device;

// actionTypes
export const INIT_SWITCHES = 'INIT_SWITCHES';
export const CHANGE_SWITCH_NAME = 'CHANGE_SWITCH_NAME';
export const CHANGE_LAST_SWITCH_TIMER = 'CHANGE_LAST_SWITCH_TIMER';

// actions
export const initSwitches = createAction(INIT_SWITCHES);
export const changeSwitchName = createAction(CHANGE_SWITCH_NAME);
export const changeLastSwitchTimer = createAction(CHANGE_LAST_SWITCH_TIMER);

// Async Actions
export const getSwitchNamesAsync = codes => async dispatch => {
  try {
    const data = await getDpsInfos();
    const switchDps = data.filter(d => codes.indexOf(d.code) !== -1) || {};
    const switchDpsObj = Object.assign(
      {},
      ...switchDps.map(value => ({
        [value.code]: value,
      }))
    );
    dispatch(initSwitches(switchDpsObj));
  } catch (err) {
    console.log('getSwitchNamesAsync Error: ', err);
  }
};

export const updateSwitchNameAsync = (code, name) => async dispatch => {
  try {
    await updateDpName(code, name);
    dispatch(changeSwitchName({ code, name }));
  } catch (err) {
    console.log('updateSwitchNameAsync Error: ', err);
  }
};

export const getLastSwitchTimersAsync = codes => async dispatch => {
  try {
    const data = await getLastTimers(codes);
    const timers = data.reduce((acc, cur) => {
      if (!cur || !cur.time || !cur.value) return acc;
      const [dpId] = Object.keys(cur.value);
      const dpCode = TYDevice.getDpCodeById(dpId);
      return {
        ...acc,
        [dpCode]: cur,
      };
    }, {});
    dispatch(changeLastSwitchTimer(timers));
  } catch (err) {
    console.log('getSwitchNamesAsync Error: ', err);
  }
};

const defaultSwitchState = {
  switches: {},
  timers: {},
};

// reducer
const switchState = handleActions(
  {
    [INIT_SWITCHES]: (state, action) => {
      return {
        ...state,
        switches: action.payload,
      };
    },

    [CHANGE_SWITCH_NAME]: (state, action) => {
      const { code, name } = action.payload;
      return {
        ...state,
        switches: {
          ...state.switches,
          [code]: {
            ...state.switches[code],
            name,
          },
        },
      };
    },

    [CHANGE_LAST_SWITCH_TIMER]: (state, action) => ({
      ...state,
      timers: action.payload,
    }),
  },
  defaultSwitchState
);

export const reducers = {
  switchState,
};

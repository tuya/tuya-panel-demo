import { handleActions, createAction } from 'redux-actions';
import _get from 'lodash/get';
import { TYSdk } from 'tuya-panel-kit';
import { commonApi } from '@tuya/tuya-panel-api';
import Strings from '../../i18n';

const { getDpsInfos, getGroupDpsInfos, updateDpName, updateGroupDpName } = commonApi.deviceApi;

// actionTypes
export const SWITCH_NAME_CHANGE = 'SWITCH_NAME_CHANGE';
export const GET_DP_DEFAULT_NAME = 'GET_DP_DEFAULT_NAME';
const MODESTATEINIT = 'MODESTATEINIT';
const MODESTATEUPDATE = 'MODESTATEUPDATE';
const LIGHTMODESTATEINIT = 'LIGHTMODESTATEINIT';
const LIGHTMODESTATEUPDATE = 'LIGHTMODESTATEUPDATE';

// actions
export const changeSwitchName = createAction('SWITCH_NAME_CHANGE');
export const getDpDefaultName = createAction('GET_DP_DEFAULT_NAME');
export const modeStateInit = createAction(MODESTATEINIT);
export const modeStateUpdate = createAction(MODESTATEUPDATE);
export const lightModeStateInit = createAction(LIGHTMODESTATEINIT);
export const lightModeStateUpdate = createAction(LIGHTMODESTATEUPDATE);

const modes = handleActions(
  {
    [modeStateInit.toString()]: (_state: any, action: any) => {
      const data = action.payload;
      return { state: data };
    },
    [modeStateUpdate.toString()]: (_state, action) => {
      const data = action.payload;
      return { state: data };
    },
  },
  {
    state: 'wait',
  }
);

const lightMode = handleActions(
  {
    [lightModeStateInit.toString()]: (_state: any, action: any) => {
      const data = action.payload;
      return { mode: data };
    },
    [lightModeStateUpdate.toString()]: (_state, action) => {
      const data = action.payload;
      return { mode: data };
    },
  },
  {
    mode: 'relay',
  }
);

const getDpName = ({ codes }) => async dispatch => {
  try {
    const devId = _get(TYSdk.devInfo, 'devId');
    const groupId = _get(TYSdk.devInfo, 'groupId');
    const postData = groupId || { gwId: devId, devId };
    const func = groupId ? getGroupDpsInfos : getDpsInfos;
    const dpsInfo: any = await func(postData);
    const filteredDps = dpsInfo.filter(d => codes.indexOf(d.code) !== -1);
    const switchNames = {};
    filteredDps.forEach(dps => {
      switchNames[dps.code] = dps.name || Strings.getDpLang(dps.code);
    });
    dispatch(getDpDefaultName(switchNames));
    // eslint-disable-next-line no-empty
  } catch (err) {}
};

export const updateDpNames = ({ code, name }) => async dispatch => {
  try {
    const devId = _get(TYSdk.devInfo, 'devId');
    const groupId = _get(TYSdk.devInfo, 'groupId');
    const postData: any = groupId
      ? { groupId, dpId: TYSdk.device.getDpIdByCode(code), name }
      : { gwId: devId, devId, dpId: TYSdk.device.getDpIdByCode(code), name };
    const func = groupId ? updateGroupDpName : updateDpName;
    await func(postData);
    dispatch(changeSwitchName({ code, name }));
  } catch (err) {
    console.log('updateDpName Error: ', err);
  }
};

export const actions = {
  getDpName,
};

const defaultSocketState = {
  socketNames: {},
  cloudStates: {
    isLoaded: false,
  },
};
// reducer
const socketState = handleActions(
  {
    [SWITCH_NAME_CHANGE]: (state, action: any) => {
      const { code, name } = action.payload;
      return {
        ...state,
        socketNames: {
          ...state.socketNames,
          [code]: name,
        },
      };
    },
    [GET_DP_DEFAULT_NAME]: (state, action) => ({
      ...state,
      socketNames: action.payload,
    }),
  },
  defaultSocketState
);
export const reducers = {
  socketState,
  modes,
  lightMode,
};

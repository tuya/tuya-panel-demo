import { DevInfo, DpValue } from 'tuya-panel-kit';
import { handleActions, createAction } from 'redux-actions';

/**
 * 在此自定义你的当前项目 dp state type
 */
export interface DpState {
  switch: boolean;
  [dpCode: string]: DpValue;
}

export interface ThemeColor {
  [key1: string]: { [key2: string]: string };
}

export interface DpExist {
  [dpCode: string]: boolean;
}

type UpdateDevInfoPayload = DevInfo;
export type UpdateDpStatePayload = Partial<DpState> & { [key: string]: DpValue }; // 保证起码有一个键值对存在

export interface UserInfo {
  admin: boolean;
  lockUserId: number;
  userId: string;
  userType: number;
  allOpenDps: string;
  allOpenType: number[];
  permanent: boolean;
  phase: number;
  productAttribute: number;
  expireTime?: number;
  effectiveTime?: number;
}
/**
 * actions
 */
const devInfoChange = createAction<UpdateDevInfoPayload>('_DEVINFOCHANGE_');
const deviceChange = createAction<UpdateDevInfoPayload>('_DEVICECHANGED_');
const responseUpdateDp = createAction<UpdateDpStatePayload>('RESPONSE_UPDATE_DP');
const updateAppTheme = createAction('UPDATE_APP_THEME_COLOR');
const existDpChange = createAction('EXIST_DP_CHANGE');
const extraInfoChange = createAction('EXTRAINFO_CHANGE');
const getOpenDoorDpIds = createAction('GET_OPEN_DOOR_DP_IDS');
const getBleOnlineState = createAction('GET_BLE_ONLINE_STATE');

export const actions = {
  devInfoChange,
  deviceChange,
  responseUpdateDp,
  updateAppTheme,
  existDpChange,
  extraInfoChange,
  getOpenDoorDpIds,
  getBleOnlineState,
};

export type Actions = { [K in keyof typeof actions]: ReturnType<typeof actions[K]> };

/**
 * reducers
 */
const dpState = handleActions<DpState, UpdateDpStatePayload | UpdateDevInfoPayload>(
  {
    [devInfoChange.toString()]: (state, action: Actions['devInfoChange']) => {
      return {
        ...state,
        ...action.payload.state,
      };
    },

    [responseUpdateDp.toString()]: (state, action: Actions['responseUpdateDp']) => ({
      ...state,
      ...action.payload,
    }),
  },
  {} as DpState
);

const devInfo = handleActions<DevInfo>(
  {
    [devInfoChange.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [deviceChange.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {} as DevInfo
);

const appTheme = handleActions<ThemeColor>(
  {
    [updateAppTheme.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {} as ThemeColor
);

const existDps = handleActions<DpExist>(
  {
    [existDpChange.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {} as DpExist
);

const extraInfo = handleActions<any>(
  {
    [extraInfoChange.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

const openDoorDpIds = handleActions<number[]>(
  {
    [getOpenDoorDpIds.toString()]: (__, action) => action.payload,
  },
  []
);

const bleOnlineState = handleActions<boolean>(
  {
    [getBleOnlineState.toString()]: (__, action) => action.payload,
  },
  false
);

export const reducers = {
  dpState,
  devInfo,
  appTheme,
  existDps,
  extraInfo,
  openDoorDpIds,
  bleOnlineState,
};

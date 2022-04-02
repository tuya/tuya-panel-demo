/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable indent */
/* eslint-disable import/no-unresolved */
import { TYSdk, DevInfo, DpValue } from 'tuya-panel-kit';
import { handleActions, createAction } from 'redux-actions';
import { Observable } from 'rxjs/Observable';
import { ActionsObservable } from 'redux-observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/partition';
import { ControlTabs, defaultLocalMusic } from '@config/default';
import { avgSplit, getPreviewColorDatas, nToHS } from '@utils';
import { Dispatch } from 'redux';
import DpCodes from '@config/dpCodes';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import SmearFormater from '@config/dragons/SmearFormater';
import _ from 'lodash';
import { saveDeviceCloudData, getDeviceCloudData } from '@api';
import { lampApi } from '@tuya/tuya-panel-api';
import { SmearMode, DimmerMode, WorkMode, SmearDataType, RgbMusicValue } from '../../types';
import { DpState, GetState } from '../type';

const { saveCloudConfig } = lampApi.generalApi;
const smearFormater = new SmearFormater();
const { smearCode, powerCode, workModeCode } = DpCodes;
const { putDeviceData } = TYSdk.device;

interface PanelState {
  test: string;
}

interface UiState {
  hue: any;
  value: any;
  saturation: any;
  effect: any;
  viewHeight: any;
  viewWidth: any;
  heigthWidhtRatio: any;
  isShowSetLampNums: any;
  setLampNumsViewHeight: any;
  dimmerMode: any;
  smearMode: any;
  ledNumber: number;
  showTab: string;
  dimmerValue: any;
  afterSmearAllWhite: boolean;
  afterSmearAll: boolean;
}

interface CloudState {
  collectedSceneIds: number[];
  localMusicList: RgbMusicValue[];
}

interface Log {
  strCodes: string;
  strIds: string;
  time: string;
  isSend: boolean;
}

type Logs = Array<Log>;

type UpdateDevInfoPayload = DevInfo;
type UpdateDpStatePayload = Partial<DpState> & { [key: string]: DpValue }; // 保证起码有一个键值对存在

/**
 * actions
 */
const devInfoChange = createAction<UpdateDevInfoPayload>('_DEVINFOCHANGE_');
const deviceChange = createAction<UpdateDevInfoPayload>('_DEVICECHANGED_');
const responseUpdateDp = createAction<UpdateDpStatePayload>('RESPONSE_UPDATE_DP');
const updateDp = createAction<UpdateDpStatePayload>('CHANGE_DP');
const consoleChange = createAction('CONSOLECHNAGE');
const clearConsole = createAction('CLEARCONSOLE');
const updatePanelState = createAction('UPDATE_PANEL_STATE');
const updateUi = createAction('UPDATE_UI');

const initCloud = createAction('INIT_CLOUD');
const updateCloud = createAction('UPDATE_CLOUD');
const updateCollectedSceneId = createAction('UPDATE_COLLECTED_SCENE_ID');
const updateLocalMusic = createAction('UPDATE_LOCAL_MUSIC');

const updateCloudState = createAction('UPDATE_CLOUD_STATE');
const replaceCloudState = createAction('REPLACE_CLOUD_STATE');

/** 根据涂抹dp来更新一遍所有lights */
export const updateLights =
  (smearData: SmearDataType, isSave = false) =>
  async (dispatch: Dispatch, getState: any) => {
    const { indexs = new Set(), dimmerMode, smearMode, combination = [] } = smearData;
    dispatch(
      updateUi({
        // 使用了油漆桶功能后 渐变按钮置灰
        afterSmearAll: smearMode === SmearMode.all && dimmerMode !== DimmerMode.combination,
        // 使用了油漆桶-白光功能后，铅笔按钮置灰
        afterSmearAllWhite: smearMode === SmearMode.all && dimmerMode === DimmerMode.white,
      })
    );

    const {
      cloudState: { lights = [] },
      uiState: { ledNumber = 0 },
    } = getState();
    let newLights = [];
    if (dimmerMode === DimmerMode.combination) {
      // 其他模式是下发单色，组合是下发多个颜色，单独处理
      newLights = getPreviewColorDatas(combination, ledNumber).map(
        ({ hue, saturation, value }) =>
          `${nToHS(hue, 4)}${nToHS(saturation, 4)}${nToHS(value, 4)}${nToHS(0, 4)}${nToHS(0, 4)}`
      );
    } else {
      const smearDataStr = smearFormater.format(smearData);
      const color = [DimmerMode.colour, DimmerMode.colourCard].includes(dimmerMode)
        ? _.padEnd(smearDataStr.slice(10, 22), 20, '0')
        : _.padStart(smearDataStr.slice(10, 18), 20, '0');
      newLights = _.times(ledNumber, i => {
        // return smearMode === SmearMode.all ? color : indexs.has(i) ? color : lights[i]
        const noneColor = new Array(ledNumber);
        noneColor.fill(0);
        const result =
          smearMode === SmearMode.all
            ? color
            : indexs.has(i)
            ? color
            : lights[i] === undefined
            ? noneColor.join('')
            : lights[i];
        return result;
      });
    }
    // @ts-ignore
    dispatch(updateCloudStates('lights', newLights, isSave));
    if (isSave) {
      saveCloudConfig('lights', newLights);
    }
  };

export const updateCloudStates =
  (key: string, data: any, isSave = true) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(updateCloudState({ [key]: data }));
      if (!isSave) return;
      // 对lights按照1024长度进行切片
      if (key === 'lights') {
        // eslint-disable-next-line no-restricted-syntax
        for (const [i, s] of avgSplit(data.join(''), 1024).entries()) {
          // eslint-disable-next-line no-await-in-loop
          await saveDeviceCloudData(`lights_${i}`, s);
        }
      } else {
        await saveDeviceCloudData(key, data);
      }
    } catch (error) {
      console.error(error);
    }
  };

export const handleToChangeLights =
  (data: any = {}, isSave = false) =>
  async (dispatch: Dispatch, getState: GetState) => {
    const {
      uiState: { dimmerMode, smearMode, ledNumber },
    } = getState();

    const smearData = { dimmerMode, smearMode, ledNumber, ...data };
    // @ts-ignore
    dispatch(updateLights(smearData, isSave));
    // 只要对灯带进行操作， 就将动效置0
    dispatch(updateUi({ effect: smearData.effect }));
    if (!isSave) return;
    const fixedWorkMode = [
      DimmerMode.colour,
      DimmerMode.colourCard,
      DimmerMode.combination,
    ].includes(dimmerMode)
      ? WorkMode.colour
      : WorkMode.white;

    dragon.putDpData(
      {
        [smearCode]: smearData,
      },
      { checkCurrent: false, useThrottle: true, clearThrottle: true }
    );
    dragon.putDpData({
      [powerCode]: true,
      [workModeCode]: fixedWorkMode,
    });
  };
/** 点击灯带 */
export const handlePressLights =
  (data: any = {}, isSave = false) =>
  // return {};
  async (dispatch: Dispatch, getState: GetState) => {
    const {
      uiState: { dimmerValue, dimmerMode, smearMode, effect },
      dpState: { colourData },
    } = getState();
    // console.log('getState', getState());
    // 只有在彩光、色卡页签，并且操作是涂抹、橡皮擦的时候, 点击灯带才会更新颜色
    if (smearMode === 0 && effect === 0) {
      return;
    }
    const _colorData = smearMode === SmearMode.all ? colourData : {};
    // @ts-ignore
    dispatch(handleToChangeLights({ ...data, ..._colorData }, isSave));
  };

/** 初始化cloudState中的lights */
export const getCloudStates = () => async (dispatch: Dispatch) => {
  try {
    const data: any = (await getDeviceCloudData()) || {};
    const localMusicList: RgbMusicValue[] = _.cloneDeep(defaultLocalMusic);

    const updates = Object.keys(data).reduce((acc: any, cur) => {
      const val = data[cur];
      acc[cur] = typeof val === 'string' ? JSON.parse(val) : val;

      // 本地音乐
      if (/^local_music_\d+$/.test(cur) && acc[cur]) {
        const id = +cur.substr(12);
        for (let i = 0; i < localMusicList.length; i++) {
          if (localMusicList[i].id === id && acc[cur]) {
            localMusicList[i] = acc[cur];
          }
        }
      }

      return acc;
    }, {});
    updates.loaded = updates.loaded?.status ?? { status: 0 };
    updates.localMusicList = localMusicList;
    dispatch(replaceCloudState(updates));
  } catch (error) {
    console.error(error);
  }
};

export const actions = {
  devInfoChange,
  deviceChange,
  responseUpdateDp,
  updateDp,
  consoleChange,
  clearConsole,
  updatePanelState,
  updateUi,
  initCloud,
  updateCloud,
  updateCollectedSceneId,
  updateLocalMusic,
  handlePressLights,
  updateLights,
  handleToChangeLights,
  updateCloudState,
  updateCloudStates,
  getCloudStates,
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
const devInfo = handleActions<DevInfo<DpState>>(
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
  {} as DevInfo<DpState>
);

const panelState = handleActions<PanelState>(
  {
    [updatePanelState.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {} as PanelState
);

const uiState = handleActions<UiState>(
  {
    [updateUi.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {
    smearMode: SmearMode.all,
    dimmerMode: DimmerMode.colour,
    dimmerValue: {
      [DimmerMode[0]]: { brightness: 1000, temperature: 0 },
      [DimmerMode[1]]: { hue: 0, saturation: 1000, value: 1000 },
      [DimmerMode[2]]: { hue: 339, saturation: 980, value: 980 },
      [DimmerMode[3]]: [],
    },
    afterSmearAll: true, // 当前灯带是否使用了油漆桶功能
    afterSmearAllWhite: false, // 当前灯带是否使用了油漆桶-白光功能
    ledNumber: 20,
    ...{
      showTab: ControlTabs.scene,
    },
  } as UiState
);

const cloudState = handleActions<CloudState>(
  {
    [initCloud.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [replaceCloudState.toString()]: (__, action) => action.payload,
    [updateCloudState.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [updateCloud.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [updateCollectedSceneId.toString()]: (state, action) => {
      const sceneId: any = action.payload;
      const { collectedSceneIds } = state;
      const newList = [...collectedSceneIds];
      const index = newList.indexOf(sceneId);
      const exist = index !== -1;
      if (exist) {
        newList.splice(index, 1);
      } else {
        newList.unshift(sceneId);
      }
      return { ...state, collectedSceneIds: newList };
    },
    [updateLocalMusic.toString()]: (state, action) => {
      const data: any = action.payload;
      const { localMusicList } = state;
      // 是否存在，不存在则添加
      const exist = localMusicList.find((music: RgbMusicValue) => {
        if (music.id === data.id) {
          Object.assign(music, data);
          return true;
        }
        return false;
      });
      if (!exist) {
        localMusicList.push(data);
      }
      return { ...state, localMusicList: [...localMusicList] };
    },
  },
  {
    collectedSceneIds: [],
    localMusicList: [],
  }
);

let isSend = false;

const formatLogs = (state: Logs, action: { payload: UpdateDpStatePayload }, send: boolean) => {
  const ret = Object.keys(action.payload).reduce((obj, p) => {
    const id = TYSdk.device.getDpIdByCode(p);
    return { ...obj, [id]: action.payload[p] };
  }, {});
  const strIds = JSON.stringify(ret, null, 2);
  const strCodes = JSON.stringify(action.payload, null, 2);
  const date = new Date();
  const time = `[${[
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  ].join(':')}]`;
  const s = [{ strCodes, strIds, time, isSend: send }, ...state];
  return s.slice(0, 30);
};

const logs = handleActions<Logs, undefined | UpdateDpStatePayload | DevInfo>(
  {
    [consoleChange.toString()]: state => {
      isSend = true;
      return state;
    },

    [updateDp.toString()]: (state, action: Actions['updateDp']) => {
      isSend = true;
      return formatLogs(state, action, isSend);
    },

    [devInfoChange.toString()]: (state, action: Actions['devInfoChange']) => {
      const formatAction = { payload: action.payload.state };
      return formatLogs(state, formatAction, isSend);
    },

    [responseUpdateDp.toString()]: (state, action: Actions['responseUpdateDp']) => {
      isSend = false;
      return formatLogs(state, action, isSend);
    },

    [clearConsole.toString()]: () => [],
  },
  []
);

export const reducers = {
  dpState,
  devInfo,
  panelState,
  logs,
  uiState,
  cloudState,
};

/**
 * epics
 */
const dpUpdateEpic$ = (action$: ActionsObservable<Actions['updateDp']>) => {
  return action$.ofType(updateDp.toString()).mergeMap(action => {
    const { payload } = action;
    const [success, error] = Observable.fromPromise(putDeviceData(payload))
      .catch(() => Observable.of(responseUpdateDp({})))
      .partition((x: { success: boolean }) => x.success);

    return Observable.merge(
      success.map(() => responseUpdateDp(payload)), // 如果每次操作都必须等到上报以后再更新，可以注释掉本段代码
      error.map(() => responseUpdateDp({}))
    );
  });
};

export const epics = [dpUpdateEpic$];

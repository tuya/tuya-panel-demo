/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
import { DevInfo, GlobalToast } from 'tuya-panel-kit';
import { Dispatch } from 'redux';
import { createAction, handleActions } from 'redux-actions';
import _ from 'lodash';
import {
  CloudConfig,
  IoTPublicConfig,
} from '@tuya-rn/tuya-native-standard-hoc/lib/withUIConfig/interface';
import dragon from '@tuya-rn/tuya-native-dragon';
import { panelConfig as defaultPanelConfig, CloudTimingCategory } from '@config';
import { dimmerModeSmeaModeMaps, defaultLocalMusic } from '@config/default';
import PresetScenes from '@config/default/scene';
import DpCodes from '@config/dpCodes';
import { avgSplit, getHomeTabFromWorkMode, getPreviewColorDatas, nToHS } from '@utils';
import * as TaskManager from '@utils/taskManager';
import SmearFormater from '@config/dragon/SmearFormater';
import {
  getDeviceCloudData,
  saveDeviceCloudData, deleteDeviceCloudData,
  addTimer,
  updateTimer,
  updateTimerStatus,
  removeTimer,
  getCategoryTimerList,
} from '@api';
import {
  DimmerValue,
  SceneDataType,
  SceneValueType,
  HomeTab,
  SmearDataType,
  WorkMode,
  DimmerMode,
  SmearMode,
  DimmerTab,
} from '@types';
import Strings from '@i18n';
import { DpState, GetState, UiState, UiStatePayload } from '../type';

const { powerCode, workModeCode, smearCode, sceneCode, countdownCode } = DpCodes;
const smearFormater = new SmearFormater();

interface Config {
  initialized: boolean;
  iot: IoTPublicConfig;
  dpFun: Record<string, any>;
  cloudFun: CloudConfig;
  misc: Record<string, any>;
}

type UpdateDevInfoPayload = DevInfo;
type UpdateDpStatePayload = Partial<DpState> & { [key: string]: DpState }; // 保证起码有一个键值对存在
type InitIoTConfigPayload = IoTPublicConfig;
type InitDpConfigPayload = Record<string, any>;
type InitCloudConfigPayload = CloudConfig;
type UpdateMiscConfigPayload = Record<string, any>;

// sync actions

const devInfoChange = createAction<UpdateDevInfoPayload>('_DEVINFOCHANGE_');
const deviceChange = createAction<UpdateDevInfoPayload>('_DEVICECHANGED_');
const updateDp = createAction<UpdateDpStatePayload>('UPDATE_DP');
const initIoTConfig = createAction<InitIoTConfigPayload>('INIT_IOT_CONFIG');
const initDpConfig = createAction<InitDpConfigPayload>('INIT_DP_CONFIG');
const initCloudConfig = createAction<InitCloudConfigPayload>('INIT_CLOUD_CONFIG');
const updateMiscConfig = createAction<UpdateMiscConfigPayload>('UPDATE_MISC_CONFIG');
const consoleChange = createAction('CONSOLECHNAGE');
const clearConsole = createAction('CLEARCONSOLE');
const updatePanelState = createAction('UPDATE_PANEL_STATE');
const updateUI = createAction<UiStatePayload>('UPDATE_UI');
const initializedConfig = createAction('INITIALIZED_CONFIG');
const updateCloudState = createAction('UPDATE_CLOUD_STATE');
const replaceCloudState = createAction('REPLACE_CLOUD_STATE');
const updateLocalMusic = createAction('UPDATE_LOCAL_MUSIC');

// async actions

export const asyncDevInfoChange = (data: any) => async (dispatch: Dispatch) => {
  dispatch(devInfoChange(data));
  data.state && dispatch(updateDp(data.state));
  dispatch(updateUI({ ledNumber: +data?.panelConfig?.fun?.strip_leaf || 20 }));
};

/** 初始化cloudState中的lights */
export const getCloudStates = () => async (dispatch: Dispatch) => {
  try {
    const data: any = (await getDeviceCloudData()) || {};
    const localMusicList: LocalMusicValue[] = _.cloneDeep(defaultLocalMusic);

    const updates = Object.keys(data).reduce((acc, cur) => {
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

export const asyncUpdateDp = (d: DpState) => (dispatch: Dispatch, getState: GetState) => {
  dispatch(updateDp(d));

  const {
    uiState: { homeTab, dimmerValue },
  } = getState();
  const uiUpdates: UiStatePayload = {};
  const workMode: WorkMode = d[workModeCode];

  // 根据workMode更新homeTab(只有当前处于workMode页面，才会去更新barMode)
  if (workMode !== undefined) {
    if ([HomeTab.dimmer, HomeTab.scene, HomeTab.music].includes(homeTab)) {
      uiUpdates.homeTab = getHomeTabFromWorkMode(workMode);
    }
  }
  // 处理涂抹dp上报
  if (d[smearCode] !== undefined) {
    // @ts-ignore wtf
    dispatch(updateLights(d[smearCode], true));
    // 根据涂抹dp上报更新dimmerValue
    const {
      dimmerMode,
      smearMode,
      hue,
      saturation,
      value,
      brightness,
      temperature,
      combination,
    }: SmearDataType = d[smearCode];
    if (smearMode === SmearMode.clear) return; // 如果是擦除，不影响dimmerValue
    // @ts-ignore wtf
    dispatch(handleDimmerModeChange(dimmerMode));
    const dimmerValueMaps = {
      [DimmerMode[0]]: { [DimmerMode[0]]: { brightness, temperature } },
      [DimmerMode[1]]: {
        [DimmerMode[1]]: { hue, saturation, value },
        [DimmerMode[2]]: { ...dimmerValue[DimmerMode[2] as DimmerTab], value },
      },
      [DimmerMode[2]]: {
        [DimmerMode[1]]: { ...dimmerValue[DimmerMode[1] as DimmerTab], value },
        [DimmerMode[2]]: { hue, saturation, value }
      },
      [DimmerMode[3]]: { [DimmerMode[3]]: combination },
    };
    uiUpdates.dimmerValue = {
      ...dimmerValue,
      ...dimmerValueMaps[DimmerMode[dimmerMode]],
    };
  }
  if (Object.keys(uiUpdates).length) dispatch(updateUI(uiUpdates));
};

export const handleToChangeLights = (data: any = {}, isSave = false) =>
  async (dispatch: Dispatch, getState: GetState) => {
    const {
      dpState: { [smearCode]: { effect } },
      uiState: { dimmerMode, smearMode, ledNumber },
    } = getState();
    const smearData = { dimmerMode, smearMode, effect, ledNumber, ...data };
    // @ts-ignore wtf
    dispatch(updateLights(smearData, isSave));
    if (!isSave) return;

    const fixedWorkMode = [DimmerMode.colour, DimmerMode.colourCard, DimmerMode.combination]
      .includes(dimmerMode)
      ? WorkMode.colour
      : WorkMode.white;
    dragon.putDpData({
      [smearCode]: smearData,
    }, { checkCurrent: false, useThrottle: false, clearThrottle: true });
    dragon.putDpData({
      [powerCode]: true,
      [workModeCode]: fixedWorkMode,
    // }, { checkCurrent: false });
    });
  };

/** 点击灯带 */
export const handlePressLights = (data: any = {}, isSave = false) =>
  async (dispatch: Dispatch, getState: GetState) => {
    const {
      uiState: { dimmerValue, dimmerMode, smearMode },
    } = getState();
    // 只有在彩光、色卡页签，并且操作是涂抹、橡皮擦的时候, 点击灯带才会更新颜色
    if (!([SmearMode.single, SmearMode.clear].includes(smearMode)
      && [DimmerMode.colour, DimmerMode.colourCard].includes(dimmerMode))) return;

    const colorData = smearMode === SmearMode.single ? dimmerValue[DimmerMode[dimmerMode]] : {};
    // @ts-ignore wtf
    dispatch(handleToChangeLights({
      ...data,
      ...colorData,
    }, isSave));
  };

/** 根据涂抹dp来更新一遍所有lights */
export const updateLights =
  (smearData: SmearDataType, isSave = false) =>
    async (dispatch: Dispatch, getState: any) => {
      const { indexs = new Set(), dimmerMode, smearMode, combination = [] } = smearData;
      dispatch(updateUI({
        // 使用了油漆桶功能后 渐变按钮置灰
        afterSmearAll: smearMode === SmearMode.all && dimmerMode !== DimmerMode.combination,
        // 使用了油漆桶-白光功能后，铅笔按钮置灰
        afterSmearAllWhite: smearMode === SmearMode.all && dimmerMode === DimmerMode.white,
      }));

      const {
        cloudState: { lights = [] },
        uiState: { ledNumber = 0 },
      } = getState();
      // console.log('更新lights --- 工作模式',smearData.dimmerMode);
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
        newLights = _.times(
          ledNumber,
          i => (smearMode === SmearMode.all ? color : indexs.has(i) ? color : lights[i])
        );
      }
      // @ts-ignore wtf
      // 白光彩光分开存
      if (dimmerMode === DimmerMode.white) {
        dispatch(updateCloudStates('whiteLights', newLights, isSave));
      } else {
        dispatch(updateCloudStates('lights', newLights, isSave));
      }
    };

export const updateCloudStates = (key: string, data: any, isSave = true) => async (
  dispatch: Dispatch
) => {
  try {
    dispatch(updateCloudState({ [key]: data }));
    if (!isSave) return;
    // 对lights按照1024长度进行切片
    if (key === 'lights' || key === 'whiteLights') {
      // eslint-disable-next-line no-restricted-syntax
      for (const [i, s] of avgSplit(data.join(''), 1024).entries()) {
        // eslint-disable-next-line no-await-in-loop
        await saveDeviceCloudData(`${key}_${i}`, s);
      }
    } else {
      await saveDeviceCloudData(key, data);
    }
  } catch (error) {
    console.error(error);
  }
};

export const handleHomeTabChange = (tab: HomeTab) => (dispatch: Dispatch) => {
  dispatch(updateUI({ homeTab: tab }));
};

/** 修正smearMode（在切换完dimmerMode之后） */
export const fixSmearMode =
  (dimmerMode: DimmerMode) => (dispatch: Dispatch, getState: GetState) => {
    const {
      uiState: { smearMode },
    } = getState();
    const supportedSmearModes = dimmerModeSmeaModeMaps[dimmerMode]; // 当前dimmerMode支持的smearMode
    if (supportedSmearModes?.includes(smearMode)) return;
    dispatch(updateUI({ smearMode: supportedSmearModes[0] })); // 默认选中支持的第一个smearMode
  };

/** 处理dimmerMode变更 */
export const handleDimmerModeChange = (mode: DimmerMode) => (dispatch: Dispatch) => {
  // @ts-ignore wtf
  dispatch(fixSmearMode(mode));
  dispatch(updateUI({ dimmerMode: mode }));
};

/** 处理调光器颜色change */
export const handleDimmerValueChange =
  (data: DimmerValue) => (dispatch: Dispatch, getState: GetState) => {
    const {
      uiState: { dimmerMode, smearMode, dimmerValue },
    } = getState();
    const dataPayload = data[DimmerMode[dimmerMode] as DimmerTab];
    dispatch(
      updateUI({
        dimmerValue: {
          ...dimmerValue,
          [DimmerMode[dimmerMode]]: dataPayload,
        },
      })
    );
    // 只有油漆桶才会直接下发
    if (smearMode !== SmearMode.all) return;
    // @ts-ignore wtf
    dispatch(handleToChangeLights({
      ...([DimmerMode.white, DimmerMode.colour, DimmerMode.colourCard].includes(dimmerMode)
        ? dataPayload
        : data),
    }, true));
  };

/** 处理渐变操作 */
export const handleSmearEffectSwitch = () => (__: Dispatch, getState: GetState) => {
  const {
    dpState: { [smearCode]: smearData },
  } = getState();
  dragon.putDpData({ [smearCode]: { ...smearData, effect: +!smearData.effect } });
  // TODO: 首次点击后有个弹窗提示
};

export const handlePutSceneData = (value: SceneValueType) => async () => {
  dragon.putDpData(
    { [sceneCode]: value },
    { checkCurrent: false, useThrottle: false, clearThrottle: true }
  );
  dragon.putDpData({ [workModeCode]: 'scene', [powerCode]: true });
};

/** 情景保存 */
export const handlePutScene = (data: SceneDataType, isEdit = false, isSave = true) =>
  async (dispatch: Dispatch, getState: GetState) => {
    let sceneData = data;
    if (!isEdit && isSave) {
      // 更新最新的scene列表，确保保存的id是最新的
      // @ts-ignore wtf
      // await dispatch(getCloudStates());
      const {
        cloudState: { scenes = [] },
      } = getState();
      const maxId = scenes.reduce((acc, cur) => Math.max(acc, +cur.id), 0);
      // DIY情景id最小200
      const newId = Math.max(200, maxId) + 1;
      sceneData = {
        ...data,
        id: newId,
        value: {
          ...data.value,
          id: newId,
        }
      };
    }
    // @ts-ignore
    dispatch(handlePutSceneData(sceneData.value));
    if (!isSave) return;
    // @ts-ignore wtf
    await dispatch(updateCloudStates(`scene_${sceneData.id}`, sceneData, true));

    GlobalToast.show({
      text: Strings.getLang(isEdit ? 'tip_edit_success' : 'tip_add_success'),
    });
    // 再更新一遍cloudStates
    // @ts-ignore wtf
    dispatch(getCloudStates());
  };

/** 情景保存 */
export const handleRemoveScene = (data: SceneDataType) =>
  async (dispatch: Dispatch) => {
    // @ts-ignore wtf
    const res = await deleteDeviceCloudData(`scene_${data.id}`);
    GlobalToast.show({
      showIcon: !!res,
      text: Strings.getLang(res ? 'tip_remove_success' : 'tip_remove_fail'),
    });
    // 再更新一遍cloudStates
    // @ts-ignore wtf
    dispatch(getCloudStates());
  };

export const handlePutCountdown = (countdown: number) => (dispatch: Dispatch) => {
  dragon.putDpData({ [countdownCode]: countdown }, { checkCurrent: false });
  GlobalToast.show({
    text: Strings.getLang(
      countdown ? 'tip_countdown_open_success' : 'tip_countdown_close_success'
    ),
  });
  // @ts-ignore wtf
  dispatch(updateCloudStates('totalCountdown', String(countdown)));
};

export const getCloudTimingList = () => async (dispatch: Dispatch) => {
  // 清理云定时互斥
  TaskManager.removeAll(TaskManager.TaskType.NORMAL_TIMING);
  const data = (await getCategoryTimerList(CloudTimingCategory)) || {};
  const cloudTimingList = _.flatMap(
    data.groups,
    item => item.timers.map(it => {
      const [hour, minute] = it.time.split(':').map(Number);
      const weeks = it.loops.split('').map(Number);
      const datas = {
        ...it,
        groupId: item.id,
        weeks,
        hour,
        minute,
        power: !!it.status,
        type: 'timer',
      };
      datas.power && TaskManager.add({
        id: datas.timerId,
        weeks: weeks.concat(0),
        startTime: hour * 60 + minute,
        endTime: hour * 60 + minute,
      }, TaskManager.TaskType.NORMAL_TIMING);
      return datas;
    })
  );
  dispatch(updateUI({ cloudTimingList }));
};

export const addCloudTiming = (...args: any[]) => async (dispatch: Dispatch) => {
  const res = await addTimer(...args);
  // @ts-ignore wtf
  dispatch(getCloudTimingList());
  return res;
};

export const updateCloudTiming = (...args: any[]) => async (dispatch: Dispatch) => {
  const res = await updateTimer(...args);
  // @ts-ignore wtf
  dispatch(getCloudTimingList());
  return res;
};

export const updateCloudTimingStatus = (...args: any[]) => async (dispatch: Dispatch) => {
  const res = await updateTimerStatus(...args);
  // @ts-ignore wtf
  dispatch(getCloudTimingList());
  return res;
};

export const removeCloudTiming = (...args: any[]) => async (dispatch: Dispatch) => {
  const res = await removeTimer(...args);
  // @ts-ignore wtf
  dispatch(getCloudTimingList());
  return res;
};

export const actions = {
  devInfoChange,
  asyncDevInfoChange,
  deviceChange,
  updateDp,
  initIoTConfig,
  initDpConfig,
  initCloudConfig,
  updateMiscConfig,
  initializedConfig,
  consoleChange,
  clearConsole,
  updatePanelState,
  updateUI,
  updateLocalMusic,
  getCloudStates,
  updateLights,
  handlePressLights,
  updateCloudState,
  updateCloudStates,
  asyncUpdateDp,
  handleHomeTabChange,
  handleDimmerModeChange,
  handleDimmerValueChange,
  handleSmearEffectSwitch,
  handlePutSceneData,
  handlePutScene,
  handleRemoveScene,
  handlePutCountdown,
  getCloudTimingList,
  addCloudTiming,
  updateCloudTiming,
  removeCloudTiming,
  updateCloudTimingStatus,
};

export type Actions = { [K in keyof typeof actions]: ReturnType<typeof actions[K]> };

/**
 * reducers
 */
const dpState = handleActions<DpState, UpdateDpStatePayload | UpdateDevInfoPayload>(
  {
    [updateDp.toString()]: (state, action: Actions['updateDp']) => ({
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

const panelConfig = handleActions<Config, any>(
  {
    [initIoTConfig.toString()]: (state, action: Actions['initIoTConfig']) => {
      return {
        ...state,
        iot: { ...state.iot, ...action.payload },
      };
    },
    [initCloudConfig.toString()]: (state, action: Actions['initCloudConfig']) => {
      return {
        ...state,
        cloudFun: { ...state.cloudFun, ...action.payload },
      };
    },
    [initDpConfig.toString()]: (state, action: Actions['initDpConfig']) => {
      return {
        ...state,
        dpFun: { ...state.dpFun, ...action.payload },
      };
    },
    [updateMiscConfig.toString()]: (state, action: Actions['updateMiscConfig']) => {
      return {
        ...state,
        misc: {
          ...state.misc,
          ...action.payload,
        },
      };
    },
    [initializedConfig.toString()]: state => {
      return {
        ...state,
        initialized: true,
      };
    },
  },
  defaultPanelConfig as Config
);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PanelState { }

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
    [updateUI.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {
    homeTab: HomeTab.dimmer,
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
    scenes: PresetScenes,
    presetScenes: PresetScenes,
    totalCountdown: 0,
    ledNumber: 20,
    cloudTimingList: [],
  }
);

const cloudState = handleActions(
  {
    [updateCloudState.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [replaceCloudState.toString()]: (__, action) => (action.payload),
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
    // loaded: 1, // 是否配网后第一次进入面板
    lights: [], // 彩光数据
    whiteLights: [], // 白光数据
    scenes: [],
    totalCountdown: 0,
  }
);

export const reducers = {
  dpState,
  devInfo,
  panelConfig,
  panelState,
  uiState,
  cloudState,
};

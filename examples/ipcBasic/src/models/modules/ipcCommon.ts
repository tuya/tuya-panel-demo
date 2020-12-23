import { handleActions, createAction } from 'redux-actions';
import { commonConfig } from '@config';
import { getDeviceCloudData, saveDeviceCloudData } from '@utils';
import { updateTheme } from './theme';

const { cx } = commonConfig;

// 是否支持对讲
const isSupportMic = createAction('IS_SUPPORT_MIC');
// 对讲方式, 默认为单向对讲
const isTwoWayTalk = createAction('IS_TWO_WAY_TALK');
// 是否在对讲中
const isTalking = createAction('IS_TALK_ING');
// 视频加载状态值
const videoStatus = createAction('VIDEO_STATUS');
// 声音喇叭状态值
const voiceStatus = createAction('VOICE_STATUS');
// 视频模式状态值
const clarityStatus = createAction('CLARITY_STATUS');
// 是否为全屏
const isFullScreen = createAction('IS_FULL_SCREEN');
// 录像中
const isRecording = createAction('IS_RECORDING');
// 录像保护3秒时间
const isRecordingDisabled = createAction('IS_RECORDING_DISABLED');
// 主题按键颜色
const panelItemActiveColor = createAction('PANEL_ITEM_ACTIVE_COLOR');
// 是否为支持拾音器
const isSupportedSound = createAction('IS_SUPPORTED_SOUND');
// 停止全屏动画
const stopFullAnim = createAction('STOP_FULL_ANIM');
// 全屏屏幕根据屏幕尺寸是否为16：9展示全屏的菜单, 左右定位起始值
const fullAbsoluteStartValue = createAction('FULL_ABSOLUTE_START_VALUE');
// 是否为安卓全面屏 主要针对全面屏使用Nav导航,屏幕实际使用高度变小,样式适配而用
const isAndriodFullScreenNavMode = createAction('IS_ANDRIOD_FULL_SCREEN_NAV_MODE');
// 默认视频按宽匹配-1 -2按高匹配 1.0~6.0为自适应放大倍数
const scaleStatus = createAction('SCALE_STATUS');
// 标记是否主动调节按宽按高
const isActiveScale = createAction('IS_ACTIVE_SCALE');
// 标记是否主动调节按宽按高
const isSupportedCloudStorage = createAction('IS_SUPPORTED_CLOUD_STORAGE');
// 枚举型选择共用dialog
const showPopCommon = createAction('SHOW_POP_COMMON');
// 枚举型和自定义dialog数据
const popData = createAction('POP_DATA');
// 自定义公用dialog
const showCustomDialog = createAction('SHOW_CUSTOM_DIALOG');
// player组件是否展示自定义load, 例如切换视频弹窗
const showCustomVideoLoad = createAction('SHOW_CUSTOM_VIDEO_LOAD');
// 自定义load文本内容
const showCustomVideoText = createAction('SHOW_CUSTOM_VIDEO_TEXT');

// 云端以设备维度记忆主题色
export const saveThemeColor = (type: string) => async dispatch => {
  try {
    saveDeviceCloudData('themeColor', { themeColor: type });
    dispatch(updateTheme({ type }));
    dispatch(updateTheme({ popup: { type } }));
    dispatch(updateTheme({ dialog: { type } }));
  } catch (e) {
    console.warn(e);
  }
};

export const getThemeColor = () => async dispatch => {
  try {
    // 配置的默认颜色, 后续云端存储有颜色变化, 以云端为主
    const data: any = await getDeviceCloudData('themeColor');
    const themeColors = data.themeColor || 'light';
    dispatch(updateTheme({ type: themeColors }));
    dispatch(updateTheme({ popup: { type: themeColors } }));
    dispatch(updateTheme({ dialog: { type: themeColors } }));
  } catch (e) {
    console.warn(e);
  }
};

export const actions = {
  isSupportMic,
  isTwoWayTalk,
  isTalking,
  videoStatus,
  clarityStatus,
  voiceStatus,
  isFullScreen,
  isRecording,
  isRecordingDisabled,
  panelItemActiveColor,
  isSupportedSound,
  stopFullAnim,
  fullAbsoluteStartValue,
  isAndriodFullScreenNavMode,
  scaleStatus,
  isActiveScale,
  isSupportedCloudStorage,
  showPopCommon,
  popData,
  showCustomDialog,
  showCustomVideoLoad,
  showCustomVideoText,
  getThemeColor,
  saveThemeColor,
};

const ipcCommonState = handleActions(
  {
    [isSupportMic.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isTwoWayTalk.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isTalking.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [videoStatus.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [voiceStatus.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [clarityStatus.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isFullScreen.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isRecording.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isRecordingDisabled.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [panelItemActiveColor.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isSupportedSound.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [stopFullAnim.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [fullAbsoluteStartValue.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isAndriodFullScreenNavMode.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [scaleStatus.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isActiveScale.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isSupportedCloudStorage.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showPopCommon.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [popData.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showCustomDialog.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showCustomVideoLoad.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showCustomVideoText.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
  {
    showLoadingToast: true,
    isSupportMic: false,
    isTwoWayTalk: false,
    isTalking: false,
    videoStatus: -1,
    clarityStatus: 'HD',
    voiceStatus: 'OFF',
    isFullScreen: false,
    isRecording: false,
    isRecordingDisabled: false,
    panelItemActiveColor: '#fc2f07',
    isSupportCloudStorage: false,

    isSupportedSound: false,
    // 停止全屏动画, 默认应为true
    stopFullAnim: true,
    // 全屏屏幕根据屏幕尺寸是否为16：9展示全屏的菜单, 左右定位起始值
    fullAbsoluteStartValue: Math.ceil(cx(5)),
    isAndriodFullScreenNavMode: true,
    scaleStatus: -1,
    // 标记是否主动调节按宽按高
    isActiveScale: false,
    // 是否支持云存储
    isSupportedCloudStorage: false,
    showPopCommon: false,
    popData: {},
    showCustomDialog: false,
    showCustomVideoLoad: false,
    showCustomVideoText: '',
  }
);

export const reducers = {
  ipcCommonState,
};

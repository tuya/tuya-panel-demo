import { handleActions, createAction } from 'redux-actions';
import TYSdk from '../../api';
import Strings from '../../i18n';
import { clarityDic } from '../../config/cameraData';

const TYEvent = TYSdk.event;
// 自定义action
// 是否展现初始化加载loading
export const showLoadingToast = createAction('showLoadingToast');
// 是否为安卓全面屏模式
export const isAndriodFullScreenNavMode = createAction('isAndriodFullScreenNavMode');
// p2p是否连接
export const p2pIsConnected = createAction('p2pIsConnected');
// video播放器load
export const showVideoLoad = createAction('SHOW_VIDEO_LOAD');
// video播放器点击重试或点击开启或低功耗设备点击唤醒字符
export const showTryAgain = createAction('SHOW_TRY_AGAIN');
// 点击重试或唤醒重新拉取视频流
export const reGetStream = createAction('RE_GET_STREAM');
// 视频加载提示文字
export const videoLoadText = createAction('VIDEO_LOAD_TEXT');
// 获取当前是为移动流量观看
export const isMobileNetType = createAction('IS_MOBILE_NET_TYPE');
// 语音对讲
export const showMic = createAction('SHOW_MIC');
// 录像
export const isRecording = createAction('IS_RECORDING');
// 录像开始后3秒后才可以停止,防止录像时间过短,出现操作失败
export const isRecordingDisabled = createAction('IS_RECORDING_DISABLED');
// 功能按键是否弹出枚举选择弹出框
export const showPopCommon = createAction('SHOW_POP_COMMON');
// 功能是否弹出自定义组件popup弹出框
export const showCustomDialog = createAction('SHOW_CUSTOM_DIALOG');
// 是否弹出自定义model
export const showSelfModal = createAction('SHOW_SELF_MODAL');
// 弹出所传数据type
export const popData = createAction('POP_DATA');
// 是否全屏
export const isFullScreen = createAction('IS_FULLSCREEN');
// 是否展现轻提示
export const showToast = createAction('SHOW_TOAST');
// 是否展现截取相册
export const showCutScreen = createAction('SHOW_CUT_SCREEN');
// 是否为录像的截屏
export const isVideoCut = createAction('IS_Video_CUT');
// 是否为支持拾音器
export const isSupportedSound = createAction('IS_SUPPORTED_SOUND');
// 展现截取相册地址
export const cutBase64Img = createAction('CUT_BASE64_IMG');
// 是否为单向对讲(
export const isInterCom = createAction('IS_INTERCOM');
// 是否有对讲(
export const hasAudio = createAction('HAS_AUDIO');
// 更新视频流
export const updateClarity = createAction('UPDATE_CLARITY');
// 更新声音状态
export const updateVoice = createAction('UPDATE_VOICE');
// 视频行为 跳转到那里
export const cameraAction = createAction('CAMERA_ACTION');
// 是否显示全屏按钮
export const hideFullMenu = createAction('HIDE_FULL_MENU');
// 是否停止全屏按钮5秒定时，并一直显示
export const stopFullAnimation = createAction('STOP_FULL_ANIMATION');
// 巡航模式显示第二天和时间更新
export const timerPickerValue = createAction('TIMER_PICKER_VALUE');
// 巡航模式显示第二天和时间更新
export const showNextDay = createAction('SHOW_NEXT_DAY');
// zoomState 0为按宽 1为按高
export const zoomState = createAction('ZOOM_STATE');
// prevZoomState
export const prevZoomState = createAction('PREV_ZOOM_STATE');
// enterPlayNativePage 0 在首页 1进入了回放 2 进入了云存储 4 进入了其它原生(设置页面) 5 从其它(设置)进入直播
export const enterPlayNativePage = createAction('ENTER_PLAY_NATIVE_PAGE');
// 因为Rn路由不销毁页面 标记是否进入了原生页面,Rn页面,非预览页面,主要处理不同手机 断电重启 一个在预览界面，一个在非预览界面,且音频开启, 针对处于隐私模式和断电重启的手机根据Dp点自动连接拉视频流的。
export const isOnLivePage = createAction('IS_ON_LIVE_PAGE');
// 功能是否弹出自定义中间弹出框
export const showSelfSdDialog = createAction('SHOW_MIDDLE_DIALOG');
// 存储卡异常，确认格式化请求
export const showSdFormatting = createAction('SHOW_SD_FORMATTING');
// 存储卡正在格式化中
export const sdIsFormatting = createAction('SD_IS_FORMATTING');
// 存储卡正在格式化中
export const panelItemActiveColor = createAction('PANEL_ITEM_ACTIVE_COLOR');
// 是否支持云存储，主要针对tab云存储界面,不支持云存储的情况下,不调用相关云存储的接口
export const isSupportCloudStorage = createAction('IS_SUPPORT_CLOUD_STORAGE');
// 云存储开通状态
export const cloudStorageState = createAction('CLOUD_STORAGE_STATE');

/**
 * 视频流状态存储
 */

export const getClarityStatus = vedioClarity => async dispatch => {
  try {
    // clarityDic为摄像头字典库
    const data = await TYSdk.getDeviceCloudData('clarityStatus');
    const getClarity = data.clarityStatus || clarityDic[vedioClarity];
    // 默认取标清流, 如果不为标清流，下发事件
    dispatch(
      updateClarity({
        clarityStatus: getClarity,
      })
    );
    if (getClarity !== 'HD') {
      TYEvent.emit('firstChangeClarity');
    }
  } catch (e) {
    console.warn(e);
  }
};

export const saveClarityStatus = flag => async dispatch => {
  try {
    TYSdk.saveDeviceCloudData('clarityStatus', { clarityStatus: flag });
    return dispatch(
      updateClarity({
        clarityStatus: flag,
      })
    );
  } catch (e) {
    console.warn(e);
  }
};

/**
 * 声音存储
 */

export const getVoiceStatus = isNoSound => async dispatch => {
  try {
    const data = await TYSdk.getDeviceCloudData('voiceStatus');
    const saveVoiceStatus = isNoSound !== undefined ? 'off' : data.voiceStatus || 'off';
    return dispatch(
      updateVoice({
        voiceStatus: saveVoiceStatus,
      })
    );
  } catch (e) {
    console.warn(e);
  }
};

export const saveVoiceStatus = type => async dispatch => {
  try {
    TYSdk.saveDeviceCloudData('voiceStatus', { voiceStatus: type });
    return dispatch(
      updateVoice({
        voiceStatus: type,
      })
    );
  } catch (e) {
    console.warn(e);
  }
};

const ipcCommonState = handleActions(
  {
    [showLoadingToast.toString()]: (state, action) => {
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
    [p2pIsConnected.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showVideoLoad.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showTryAgain.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [reGetStream.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [videoLoadText.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isMobileNetType.toString()]: (state, action) => {
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
    [showMic.toString()]: (state, action) => {
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
    [showCustomDialog.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showSelfModal.toString()]: (state, action) => {
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
    [isFullScreen.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showToast.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },

    [showCutScreen.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isVideoCut.toString()]: (state, action) => {
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
    [cutBase64Img.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isInterCom.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [hasAudio.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [updateClarity.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [updateVoice.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [cameraAction.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [hideFullMenu.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [stopFullAnimation.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [timerPickerValue.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showNextDay.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [zoomState.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [prevZoomState.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [enterPlayNativePage.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [isOnLivePage.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showSelfSdDialog.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [showSdFormatting.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [sdIsFormatting.toString()]: (state, action) => {
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
    [isSupportCloudStorage.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    [cloudStorageState.toString()]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
  {
    showLoadingToast: true,
    isAndriodFullScreenNavMode: true,
    p2pIsConnected: false,
    showVideoLoad: true,
    showTryAgain: false,
    reGetStream: false,
    videoLoadText: Strings.getLang('bridgeConnect'),
    isMobileNetType: false,
    isRecording: false,
    isRecordingDisabled: false,
    showMic: false,
    showPopCommon: false,
    showCustomDialog: false,
    showSelfModal: false,
    popData: {},
    isFullScreen: false,
    showToast: false,
    showCutScreen: false,
    isVideoCut: false,
    isSupportedSound: false,
    isInterCom: true, // 是单向对讲
    hasAudio: false,
    clarityStatus: 'HD',
    voiceStatus: 'off', // off表示静音
    cameraAction: 0, // 0位于直播页面, 1 跳出了直播  2从回放及云存储回到直播
    hideFullMenu: false,
    stopFullAnimation: false,
    cutBase64Img: '',
    timerPickerValue: [480, 482],
    showNextDay: false,
    //  0 按宽 1 按高 2自由
    zoomState: 0,
    prevZoomState: 0,
    enterPlayNativePage: 0,
    isOnLivePage: true,
    showSelfSdDialog: false,
    showSdFormatting: false,
    sdIsFormatting: false,
    // 面板录像，panel激活图标颜色，ptz等等带点的颜色
    panelItemActiveColor: '#fc2f07',
    isSupportCloudStorage: false,
    // 默认未开通
    cloudStorageState: false,
  }
);

export const reducers = {
  ipcCommonState,
};

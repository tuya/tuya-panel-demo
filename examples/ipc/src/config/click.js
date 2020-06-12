/* eslint-disable max-len */
/* eslint-disable camelcase */
import { Platform } from 'react-native';
import { TYSdk, Popup } from 'tuya-panel-kit';
import moment from 'moment';
import _ from 'lodash';
import { store } from '../main';
import Strings from '../i18n';
import Res from '../res';
import {
  showCutScreen,
  isRecording,
  isRecordingDisabled,
  showMic,
  saveClarityStatus,
  showVideoLoad,
  videoLoadText,
  isFullScreen,
  saveVoiceStatus,
  isInterCom,
  hasAudio,
  showCustomDialog,
  cutBase64Img,
  isVideoCut,
  isSupportedSound,
  getClarityStatus,
  getVoiceStatus,
  isMobileNetType,
  isOnLivePage,
  showSelfSdDialog,
  showSdFormatting,
  cameraAction,
  enterPlayNativePage,
  updateClarity,
  panelItemActiveColor,
  p2pIsConnected,
  showLoadingToast,
} from '../redux/modules/ipcCommon';
import { updateTheme } from '../redux/modules/theme';
import { localTimeExample, cruiseScheduleTime, feedNumScheduleTime } from '../config/dpTimeData';
import CameraManager from '../components/nativeComponents/cameraManager';

const TYNative = TYSdk.native;
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

/**
 * 跳转至原生设置界面
 */

export const cameraPanelSettings = () => {
  try {
    !isRecordingNow() && !isMicTalking() && CameraManager.gotoCameraPanelMore();
    store.dispatch(isOnLivePage({ isOnLivePage: false }));
    store.dispatch(cameraAction({ cameraAction: 4 }));
    store.dispatch(enterPlayNativePage({ enterPlayNativePage: 4 }));
  } catch (e) {
    CameraManager.showTip(Strings.getLang('systemError'));
  }
};

/**
 * 跳转至云存储H5购买界面
 */

export const gotoCloudH5PurcharsePage = h5Url => {
  try {
    !isRecordingNow() && !isMicTalking() && CameraManager.gotoHybridContainer(h5Url);
    store.dispatch(isOnLivePage({ isOnLivePage: false }));
  } catch (e) {
    CameraManager.showTip(Strings.getLang('systemError'));
  }
};

/**
 * 跳转至回放界面
 */
export const gotoCameraNewPlaybackPanel = () => {
  try {
    !isRecordingNow() && !isMicTalking() && CameraManager.gotoCameraNewPlaybackPanel();
    store.dispatch(isOnLivePage({ isOnLivePage: false }));
  } catch (e) {
    CameraManager.showTip(Strings.getLang('systemError'));
  }
};

/**
 * 跳转至云存储界面
 */

export const gotoCloudStoragePanel = () => {
  try {
    !isRecordingNow() && !isMicTalking() && CameraManager.gotoCloudStoragePanel();
    store.dispatch(isOnLivePage({ isOnLivePage: false }));
  } catch (e) {
    CameraManager.showTip(Strings.getLang('systemError'));
  }
};

/**
 * 拍照
 */
// eslint-disable-next-line import/prefer-default-export
export const snapShoot = () => {
  if (Platform.OS === 'ios') {
    try {
      CameraManager.snapShootToAlbum(
        msg => {
          store.dispatch(showCutScreen({ showCutScreen: true }));
          store.dispatch(isVideoCut({ isVideoCut: false }));
          store.dispatch(cutBase64Img({ cutBase64Img: msg }));
          TYEvent.emit('readyCloseCutScreen');
        },
        () => {
          store.dispatch(isVideoCut({ isVideoCut: false }));
          CameraManager.showTip(Strings.getLang('cutScreeFail'));
        }
      );
    } catch (err) {
      CameraManager.showTip(Strings.getLang('systemError'));
    }
  } else {
    CameraManager.snapShoot(
      msg => {
        store.dispatch(showCutScreen({ showCutScreen: true }));
        store.dispatch(isVideoCut({ isVideoCut: false }));
        store.dispatch(cutBase64Img({ cutBase64Img: msg }));
        TYEvent.emit('readyCloseCutScreen');
      },
      () => {
        // 不管啥，失败就弹
        CameraManager.showTip(Strings.getLang('cutScreeFail'));
      }
    );
  }
};

/**
 * 录像功能
 */

export const enableRecord = () => {
  CameraManager.isRecording(msg => {
    if (msg) {
      CameraManager.stopRecord(
        imgSource => {
          store.dispatch(isRecording({ isRecording: false }));
          if (Platform.OS === 'ios') {
            store.dispatch(showCutScreen({ showCutScreen: true }));
            // 是不是录像的截屏
            store.dispatch(isVideoCut({ isVideoCut: true }));
            store.dispatch(cutBase64Img({ cutBase64Img: imgSource }));
          } else {
            store.dispatch(showCutScreen({ showCutScreen: true }));
            store.dispatch(isVideoCut({ isVideoCut: true }));
            store.dispatch(cutBase64Img({ cutBase64Img: imgSource }));
          }
          TYEvent.emit('readyCloseCutScreen');
        },
        () => {
          store.dispatch(isRecording({ isRecording: false }));
          CameraManager.showTip(Strings.getLang('recordFail'));
        }
      );
    } else if (Platform.OS === 'ios') {
      try {
        CameraManager.startRecordToAlbum(
          () => {
            store.dispatch(isRecording({ isRecording: true }));
            CameraManager.showTip(Strings.getLang('recordStart'));
            store.dispatch(isRecordingDisabled({ isRecordingDisabled: true }));
            setTimeout(() => {
              store.dispatch(isRecordingDisabled({ isRecordingDisabled: false }));
            }, 3000);
          },
          () => {
            CameraManager.showTip(Strings.getLang('operatorFailed'));
          }
        );
      } catch (err) {
        CameraManager.showTip(Strings.getLang('systemError'));
      }
    } else {
      CameraManager.startRecord(
        () => {
          store.dispatch(isRecording({ isRecording: true }));
          CameraManager.showTip(Strings.getLang('recordStart'));
          store.dispatch(isRecordingDisabled({ isRecordingDisabled: true }));
          setTimeout(() => {
            store.dispatch(isRecordingDisabled({ isRecordingDisabled: false }));
          }, 3000);
        },
        () => {
          CameraManager.showTip(Strings.getLang('operatorFailed'));
        }
      );
    }
  });
};

// 定义开启静音或关闭声音的方法
export const operatMute = type => {
  CameraManager.enableMute(
    type === 'off',
    () => {
      store.dispatch(saveVoiceStatus(type));
    },
    () => {
      const state = store.getState();
      const { ipcCommonState } = state;
      // 如果在录像时,切换声音报错规避掉,因为可以正常对讲
      if (!ipcCommonState.isRecording) {
        CameraManager.showTip(Strings.getLang('operatorFailed'));
      }
    }
  );
};

// 长按单向对讲开启

export const enableStartTalk = () => {
  CameraManager.startTalk(
    () => {
      store.dispatch(showMic({ showMic: true }));
    },
    () => {
      CameraManager.showTip(Strings.getLang('operatorFailed'));
    }
  );
};

// 移除单向对讲开启

export const enableStopTalk = () => {
  const state = store.getState();
  CameraManager.stopTalk(
    () => {
      store.dispatch(showMic({ showMic: false }));
      const { ipcCommonState } = state;
      if (ipcCommonState.isInterCom) {
        CameraManager.showTip(Strings.getLang('interEndTalk'));
        operatMute('on');
      } else {
        CameraManager.showTip(Strings.getLang('interEndCall'));
      }
    },
    () => {
      CameraManager.showTip(Strings.getLang('operatorFailed'));
    }
  );
};

// 切换高清标清, 目前只有两种，后期若有多种视频流，需App新接口支持
export const enableHd = (type, configInfo) => {
  let loadText = Strings.getLang('videoResolutionIng');
  if (configInfo === 'configInfo') {
    loadText = Strings.getLang('getStream');
    console.log('云端清晰度不为高清和默认清晰度');
  } else {
    // 这么写的目的是 第一次默认不是高清时，可能进入页面切换到标清会出新loading框
    store.dispatch(videoLoadText({ videoLoadText: loadText }));
    store.dispatch(showVideoLoad({ showVideoLoad: true }));
  }
  CameraManager.enableHd(
    type === 'HD',
    () => {
      store.dispatch(saveClarityStatus(type));
      store.dispatch(showVideoLoad({ showVideoLoad: false }));
    },
    () => {
      store.dispatch(videoLoadText({ videoLoadText: Strings.getLang('videoResolutionErr') }));
      store.dispatch(showVideoLoad({ showVideoLoad: false }));
      CameraManager.showTip(Strings.getLang('operatorFailed'));
    }
  );
};

// 进入全屏
export const enterFullScreen = () => {
  CameraManager.setScreenOrientation(1);
  // 设置屏幕方向 0: 竖屏 1: 横屏
  store.dispatch(isFullScreen({ isFullScreen: true }));
};

// 退出Rn面板调用的方法

export const backRnSystem = () => {
  enterBackground();
  CameraManager.disconnect();
};

// 进入后台需调用的方法
export const enterBackground = () => {
  // 停止预览，需先判断是否再录像,在录像判断的回调里停止预览,可以保证录像会保存下来
  CameraManager.isRecording(msg => {
    if (msg) {
      CameraManager.stopRecord(
        () => {
          CameraManager.stopPreview(
            () => {},
            () => {}
          );
        },
        () => {}
      );
      store.dispatch(isRecording({ isRecording: false }));
      store.dispatch(isRecordingDisabled({ isRecordingDisabled: false }));
    } else {
      CameraManager.stopPreview(
        () => {},
        () => {}
      );
    }
  });
  CameraManager.isTalkBacking(msg => {
    if (msg) {
      CameraManager.stopTalk(
        () => {},
        () => {}
      );
      store.dispatch(showMic({ showMic: false }));
    }
  });

  CameraManager.isMuting(msg => {
    if (!msg) {
      CameraManager.enableMute(
        true,
        () => {},
        () => {}
      );
    }
  });
};

// 分发配p2p连接后，获取对讲的方式
export const getAuduioType = () => {
  CameraManager.isSupportedTalk(result => {
    if (result) {
      CameraManager.supportedAudioMode(msg => {
        const addObj = {
          test: 'micTest',
          key: 'mic',
          imgSource: Res.publicImage.fullOneWayTalk,
          imgTitle: Strings.getLang('bottom_oneway_talk'),
        };
        if (msg === 1) {
          // 有对讲
          store.dispatch(hasAudio({ hasAudio: true }));
          store.dispatch(isInterCom({ isInterCom: true }));
        } else if (msg === 2) {
          // 有对讲
          store.dispatch(hasAudio({ hasAudio: true }));
          store.dispatch(isInterCom({ isInterCom: false }));
          addObj.imgTitle = Strings.getLang('bottom_twoway_talk');
          addObj.imgSource = Res.publicImage.basicTwoWayTalk;
        }
        TYEvent.emit('autoMode', addObj);
      });
    } else {
      store.dispatch(hasAudio({ hasAudio: false }));
    }
  });
};

// 跳转至原生的云端定时页面
export const enterNativeSchedule = (type, data) => {
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  Popup.close();
  store.dispatch(isOnLivePage({ isOnLivePage: false }));
  store.dispatch(showCustomDialog({ showCustomDialog: false }));
  setTimeout(() => {
    TYNative.gotoDpAlarm({
      category: type,
      repeat: 0,
      data,
    });
  }, 800);
};

// 从非预览页面跳转至视频预览界面
export const backNavigatorLivePlay = () => {
  const TYNavigator = TYSdk.Navigator;
  TYNavigator.pop();
};

// 从非预览页面跳转至视频预览界面组件销毁时调用
export const backLivePlayWillUnmount = () => {
  store.dispatch(videoLoadText({ videoLoadText: Strings.getLang('reConenectStream') }));
  store.dispatch(showVideoLoad({ showVideoLoad: true }));
  store.dispatch(isOnLivePage({ isOnLivePage: true }));
  TYEvent.emit('backLivePreview');
};

// 跳转原生全部消息中心
export const gotoCameraMessageAll = () => {
  try {
    if (isRecordingNow() || isMicTalking()) {
      return false;
    }
    CameraManager.gotoCameraMessageCenterPanel();
    store.dispatch(isOnLivePage({ isOnLivePage: false }));
  } catch (err) {
    CameraManager.showTip(Strings.getLang('systemError'));
  }
};

// 3.16跳转原生消息中心预览视频与图片
export const gotoCameraMessagePreview = params => {
  try {
    if (isRecordingNow() || isMicTalking()) {
      return false;
    }
    CameraManager.gotoMediaPlayer(params);
    store.dispatch(isOnLivePage({ isOnLivePage: false }));
  } catch (err) {
    CameraManager.showTip(Strings.getLang('systemError'));
  }
};

// 获取摄像头配置信息
export const getConfigCameraInfo = () => {
  try {
    CameraManager.obtainCameraConfigInfo(result => {
      const { vedioClarity } = result;
      // 获取配置信息
      console.log('获取配置信息');
      store.dispatch(getClarityStatus(vedioClarity));
    });
  } catch (err) {
    console.warn('配置信息');
    CameraManager.showTip(Strings.getLang('systemError'));
  }
};

// P2P连接之后第一次进界面获取是否具有拾音器
export const getSupportedSound = () => {
  try {
    CameraManager.isSupportedSound(result => {
      console.log('是否支持声音', result);
      if (result) {
        store.dispatch(isSupportedSound({ isSupportedSound: true }));
        // 获取云端保存的喇叭
        store.dispatch(getVoiceStatus());
      } else {
        // 如果不支持声音，置为静音
        store.dispatch(isSupportedSound({ isSupportedSound: false }));
        store.dispatch(getVoiceStatus('off'));
      }
    });
  } catch (err) {
    CameraManager.showTip(Strings.getLang('systemError'));
  }
};

// 3.16 获取当前是移动流量还是wifi
export const isMobileDataNetworkType = () => {
  try {
    CameraManager.isMobileDataNetworkType(result => {
      store.dispatch(isMobileNetType({ isMobileNetType: result }));
    });
  } catch (err) {
    CameraManager.showTip(`${Strings.getLang('systemError')}:isMobileDataNetworkType`);
  }
};

// 点击退出录像提示正在录像中,请先停止录像
export const isRecordingNow = () => {
  const state = store.getState();
  const { ipcCommonState } = state;
  if (ipcCommonState.isRecording) {
    CameraManager.showTip(Strings.getLang('live_page_is_recording_tip'));
    return true;
  }
  return false;
};

// 录像时 点击声音切换，提示不允许切换
export const isRecordingChangeMute = () => {
  const state = store.getState();
  const { ipcCommonState } = state;
  if (ipcCommonState.isRecording) {
    CameraManager.showTip(Strings.getLang('live_page_is_recording_and_change_mute_tip'));
    return true;
  }
  return false;
};

// 录像时 点击声音切换，提示不允许切换
export const isMicTalking = () => {
  const state = store.getState();
  const { ipcCommonState } = state;
  if (ipcCommonState.showMic) {
    CameraManager.showTip(Strings.getLang('live_page_is_talking_tip'));
    return true;
  }
  return false;
};

// 跳转至固定Rn页面
export const enterRnPage = (id, data) => {
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  Popup.close();
  store.dispatch(isOnLivePage({ isOnLivePage: false }));
  enterBackground();
  const TYNavigator = TYSdk.Navigator;
  TYNavigator.push({
    id,
    ...data,
  });
};

// 获取巡航模式状态
export const getCuriseStatus = () => {
  const state = store.getState();
  const curiseData = state.dpState.cruise_switch;
  if (typeof curiseData === 'undefined') {
    // 表示没有配置巡航,只有收藏点
    return false;
  }
  return curiseData;
};

// SD卡初始插卡状态判断, 每次进入面板获取
export const getSdCardStatus = sdCardStatus => {
  let sdData = sdCardStatus;
  if (!sdData) {
    const state = store.getState();
    sdData = state.dpState.sd_status;
  }
  switch (sdData) {
    case 2:
      showSdFormatDialog();
      break;
    case 4:
      showFormattingDialog();
      break;
    case 6:
      showSdFormatConfigDialog();
      break;
    default:
      return false;
  }
};

// 展示格式化弹出框
export const showFormattingDialog = () => {
  TYNative.hideLoading();
  store.dispatch(showSdFormatting({ showSdFormatting: true }));
};

// 监听sd卡状态上报为2 或主动查询为2
export const showSdFormatDialog = () => {
  TYNative.simpleConfirmDialog(
    Strings.getLang('sd_abnormal_title'),
    Strings.getLang('sd_abnormal_text'),
    () => {
      // 下发触发格式化命令
      TYNative.showLoading({ title: '' });
      TYDevice.putDeviceData({
        sd_format: true,
      });
    },
    () => {}
  );
};

// 展示初始存储卡配置
export const showSdFormatConfigDialog = () => {
  store.dispatch(showSelfSdDialog({ showSelfSdDialog: true }));
};

// 判断功能点配置的Tab是否存在已有的值,如果错误,返回已有的默认值
export const isExistTabConfig = (configName, isShare) => {
  // configName 为功能点配置的key, isShare表示是否为分享的设备
  const tabConfigNameLegal = ['notify', 'ptzZoom', 'point', 'feature', 'cloudStorage', 'feed'];
  const shareConfigNameLegal = ['notify', 'ptzZoom', 'feed', 'cloudStorage'];
  if (isShare && shareConfigNameLegal.indexOf(configName) !== -1) {
    return configName;
  }
  if (isShare && shareConfigNameLegal.indexOf(configName) === -1) {
    return 'notify';
  }

  if (!isShare && tabConfigNameLegal.indexOf(configName) !== -1) {
    return configName;
  }

  if (!isShare && tabConfigNameLegal.indexOf(configName) === -1) {
    return 'feature';
  }
};

// 跳转到dp本地定时页面
export const enterDpTimePage = key => {
  switch (key) {
    case 'localTime':
      localTimeExample();
      break;
    // 巡航本地定时
    case 'cruiseSchedule':
      cruiseScheduleTime();
      break;
    // 宠物喂食本地定时
    case 'feedNumSchedule':
      feedNumScheduleTime();
      break;
    default:
      return false;
  }
};

// 第一次进入预览直播页面
export const getInitLiveConig = () => {
  // 获取sd卡的状态
  getSdCardStatus();
  // 获取面板录像，panel激活图标颜色，ptz等等带点的颜色
  const state = store.getState();
  const panelItemActiveColors = _.get(state.devInfo, 'panelConfig.fun.panelItemActiveColor');
  panelItemActiveColors &&
    store.dispatch(panelItemActiveColor({ panelItemActiveColor: panelItemActiveColors }));
  // 获取功能点配置的主题色
  const panelSkins = _.get(state.devInfo, 'panelConfig.fun.panelSkin');
  panelSkins && store.dispatch(updateTheme({ type: panelSkins }));
  // 设置只支持标清
  const onlySd = _.get(state.devInfo, 'panelConfig.fun.onlySd');
  onlySd && store.dispatch(updateClarity({ updateClarity: 'SD' }));
};

// 判定是否为低功耗设备
export const isWirlesDevice = () => {
  const state = store.getState();
  const { wireless_awake } = state.dpState;
  if (typeof wireless_awake !== 'undefined') {
    return true;
  }
  return false;
};

// 低功耗三次唤醒低功耗设备
export const wakeupWirless = () => {
  CameraManager.wakeUpDoorBell();
  console.log('---->wake 1次');
  CameraManager.wakeUpDoorBell();
  console.log('---->wake 2次');
  CameraManager.wakeUpDoorBell();
  console.log('---->wake 3次');
  // 视频预览自己无需做定时操作,底层会进行推送
  // 10秒超时
};

// 产品退到手机后台进程,使用Rn自己的方法进行判断,断开p2p连接,其余进入后台操作使用原生的事件进行监听
export const enterPhoneBackground = () => {
  console.log('进入后台5秒后,主动断开P2p连接');
  CameraManager.disconnect();
};

// 判定p2p是否连接,如未连接,进行连接，否则忽略
export const judgeP2pISConnectedOperate = () => {
  CameraManager.isConnected(msg => {
    console.log('进入非预览界面，判定P2P是否连接', msg);
    // 如果是低功耗先对其进行唤醒
    if (!msg) {
      store.dispatch(p2pIsConnected({ p2pIsConnected: false }));
      if (isWirlesDevice()) {
        wakeupWirless();
      }
      CameraManager.connect(
        () => {
          store.dispatch(p2pIsConnected({ p2pIsConnected: true }));
        },
        () => {}
      );
    }
  });
};

// 消息动态跳转,Rn判断逻辑，选择进入回放或云存储
export const goToMessageDynamicGotoWithParams = time => {
  const params = { time };
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  const currentTimeStamp = moment(new Date()).valueOf() / 1000;
  const { isHasSdCard, isHasCloud, cloudStorageState } = judgeSdAndCloud();
  const diffTime = currentTimeStamp - time;
  enterBackground();
  if (
    (isHasCloud && !isHasSdCard && cloudStorageState) ||
    (isHasCloud && isHasSdCard && cloudStorageState && diffTime > 120)
  ) {
    store.dispatch(enterPlayNativePage({ enterPlayNativePage: 2 })); // 0 是进入预览 1是进入回放 2是进入云存储
    try {
      CameraManager.gotoCloudStoragePanelWithParams(params);
    } catch (err) {
      CameraManager.showTip(`${Strings.getLang('systemError')}gotoCloudStoragePanelWithParams`);
    }
  } else {
    store.dispatch(enterPlayNativePage({ enterPlayNativePage: 1 })); // 0 是进入预览 1是进入回放 2是进入云存储
    try {
      CameraManager.gotoCameraNewPlaybackPanelWithParams(params);
    } catch (err) {
      CameraManager.showTip(
        `${Strings.getLang('systemError')}gotoCameraNewPlaybackPanelWithParams`
      );
    }
  }
};

// 判定是否有回放和云存储;
export const judgeSdAndCloud = () => {
  const state = store.getState();
  const { sd_status } = state.dpState;
  const { isSupportCloudStorage, cloudStorageState } = state.ipcCommonState;
  const isHasSdCard = Boolean(sd_status);

  return {
    isHasSdCard,
    isHasCloud: isSupportCloudStorage,
    cloudStorageState,
  };
};

// 云存储事件跳转到原生,具体进行播放
export const goToNativeCloudEventDetailPlayTime = time => {
  const params = { time };
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  try {
    store.dispatch(enterPlayNativePage({ enterPlayNativePage: 2 }));
    CameraManager.gotoCloudStoragePanelWithParams(params);
  } catch (err) {
    CameraManager.showTip(`${Strings.getLang('systemError')}gotoCloudStoragePanelWithParams`);
  }
};

// 关闭全局lodaing
export const closeGlobalLoading = () => {
  setTimeout(() => {
    store.dispatch(showLoadingToast({ showLoadingToast: false }));
  }, 500);
};

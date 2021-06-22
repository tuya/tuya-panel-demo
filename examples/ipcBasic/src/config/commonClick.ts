import { Linking } from 'react-native';
import { TYIpcNative } from '@tuya/tuya-panel-ipc-sdk';
import { TYSdk, Popup } from 'tuya-panel-kit';
import Strings from '@i18n';
import _ from 'lodash';
import { store, actions } from '@models';
import { NativeParamInter } from './commonInterface';
import { popDataSchema } from './popDataStore';

const TYNative = TYSdk.native;

const isRecordingNow = () => {
  const state = store.getState();
  const { ipcCommonState } = state;
  if (ipcCommonState.isRecording) {
    TYIpcNative.showToast(Strings.getLang('live_page_is_recording_tip'));
    return true;
  }
  return false;
};

const backDeviceToList = () => {
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  TYNative.back();
};

const isMicTalking = () => {
  const state = store.getState();
  const { ipcCommonState } = state;
  if (ipcCommonState.isTalking) {
    TYIpcNative.showToast(Strings.getLang('live_page_is_talking_tip'));
    return true;
  }
  return false;
};

const isRecordingChangeMute = () => {
  const state = store.getState();
  const { ipcCommonState } = state;
  if (ipcCommonState.isRecording) {
    TYIpcNative.showToast(Strings.getLang('live_page_is_recording_and_change_mute_tip'));
    return true;
  }
  return false;
};

const toggleNativePage = (key: string, time?: any) => {
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  const state = store.getState();
  const { type } = state.theme;
  // 跳转原生的主题色, 定义的黑色值是1，白色的是2 ，默认的是0
  const nativeThemeValue = type === 'dark' ? 1 : 2;
  const sendParam: NativeParamInter = { theme: nativeThemeValue };
  time !== undefined && (sendParam.time = time);
  switch (key) {
    case 'paramPlayBack':
      TYIpcNative.enterParamPlayBack(sendParam);
      break;
    case 'paramCloudBack':
      TYIpcNative.enterParamCloudBack(sendParam);
      break;
    case 'paramMessageAll':
      TYIpcNative.enterParamMessageAll({ theme: nativeThemeValue });
      break;
    case 'paramAlbum':
      TYIpcNative.enterParamAlbum({ theme: nativeThemeValue });
      break;
    case 'setting':
      TYIpcNative.enterCameraSetting();
      break;
    default:
      break;
  }
};

const setScreenOrientation = (value: 1 | 0) => {
  TYIpcNative.setScreenOrientation(value);
};

export const enableRecord = () => {
  TYIpcNative.enableRecord().then((data: any) => {
    const { success, isSaveErr } = data;
    if (!success && isSaveErr) {
      // 表示保存出错
      TYIpcNative.showToast(Strings.getLang('recordSaveErr'));
    } else if (!success && !isSaveErr) {
      // 表示启用出错
      TYIpcNative.showToast(Strings.getLang('operatorFailed'));
    }
  });
};

export const snapShoot = () => {
  TYIpcNative.snapShoot().then((data: any) => {
    const { success } = data;
    !success && TYIpcNative.showToast('cutSaveErr');
  });
};

export const enableMute = () => {
  const state = store.getState();
  const { voiceStatus, isRecording } = state.ipcCommonState;
  const sendParam = voiceStatus === 'OFF' ? 'ON' : 'OFF';
  TYIpcNative.enableMute(sendParam).then((data: any) => {
    const { success } = data;
    if (success) {
      store.dispatch(actions.ipcCommonActions.voiceStatus({ voiceStatus: sendParam }));
    } else if (!isRecording) {
      TYIpcNative.showToast(Strings.getLang('operatorFailed'));
    }
  });
};

const adjustSize = () => {
  const state = store.getState();
  const { scaleStatus } = state.ipcCommonState;
  let sendScaleStatus = -1;
  if (scaleStatus === -1 || scaleStatus === 1 || scaleStatus === 1.0) {
    sendScaleStatus = -2;
  } else if (scaleStatus === -2) {
    sendScaleStatus = -1;
  }
  store.dispatch(actions.ipcCommonActions.scaleStatus({ scaleStatus: sendScaleStatus }));
};

const isSuppportedCloudStorage = () => {
  TYIpcNative.isSupportedCloudStorage().then((data: any) => {
    const { isSupported } = data;
    if (isSupported) {
      store.dispatch(
        actions.ipcCommonActions.isSupportedCloudStorage({ isSupportedCloudStorage: isSupported })
      );
    }
  });
};

const changeClarityAndAudio = (value: any) => {
  store.dispatch(
    actions.ipcCommonActions.showCustomVideoLoad({
      showCustomVideoLoad: true,
    })
  );
  store.dispatch(
    actions.ipcCommonActions.showCustomVideoText({
      showCustomVideoText:
        value === 'AUDIO'
          ? Strings.getLang('audioResolutionIng')
          : Strings.getLang('videoResolutionIng'),
    })
  );

  TYIpcNative.changeClarityAndAudio(value).then((data: any) => {
    const { success } = data;
    if (!success) {
      TYIpcNative.showToast(Strings.getLang('videoResolutionErr'));
    } else if (value !== 'AUDIO') {
      store.dispatch(
        actions.ipcCommonActions.clarityStatus({
          clarityStatus: value,
        })
      );
    } else {
      TYIpcNative.enableMute('ON').then((result: any) => {
        const { success: successMute } = result;
        if (successMute) {
          store.dispatch(
            actions.ipcCommonActions.voiceStatus({
              clarityStatus: value,
            })
          );
        } else {
          TYIpcNative.showToast(Strings.getLang('voiceChangeErr'));
        }
      });
    }
    store.dispatch(
      actions.ipcCommonActions.showCustomVideoLoad({
        showCustomVideoLoad: false,
      })
    );
  });
};

const savePopDataToRedux = (key: string, dpValue: any) => {
  let originDpSchema: any = {};
  // 获取dpSchema的原始值
  if (key === 'generalTheme') {
    originDpSchema = popDataSchema[key];
  } else {
    originDpSchema = filterDpRange(key);
  }
  const { showData, title } = originDpSchema;
  showData.forEach((item: any, index: number) => {
    if (item.value === dpValue) {
      showData[index].checked = true;
    } else {
      showData[index].checked = false;
    }
  });
  const sendPopData = {
    // 需要将第一次默认的选值传进来;
    dpValue,
    title,
    mode: key,
    showData,
  };
  store.dispatch(
    actions.ipcCommonActions.popData({
      popData: sendPopData,
    })
  );
  store.dispatch(
    actions.ipcCommonActions.showPopCommon({
      showPopCommon: true,
    })
  );
};

const saveCustomDialogDataToRedux = (key: string) => {
  const originDialogData = popDataSchema[key];
  const sendPopData = originDialogData;
  store.dispatch(
    actions.ipcCommonActions.popData({
      popData: sendPopData,
    })
  );
  store.dispatch(
    actions.ipcCommonActions.showCustomDialog({
      showCustomDialog: true,
    })
  );
};

const filterDpRange = key => {
  const originDpSchema = popDataSchema[key];
  const { showData, title } = originDpSchema;
  const state = store.getState();
  const { schema } = state.devInfo;
  // 获取dpRange范围
  const dpRange: any = schema[key].range;
  showData.forEach((items: any) => {
    const values = items.value;
    if (dpRange.indexOf(values) === -1) {
      _.remove(showData, (item: any) => {
        return item.value === values;
      });
    }
  });
  return {
    showData,
    title,
  };
};

const changePanelTheme = (key: string) => {
  const state: any = store.getState();
  const { type } = state.theme;
  savePopDataToRedux(key, type);
};

const changeThemeState = (value: string) => {
  store.dispatch(actions.ipcCommonActions.saveThemeColor(value));
};

const getInitLiveConig = () => {
  store.dispatch(actions.ipcCommonActions.getThemeColor());
};

const resoultionData = clarityType => {
  const sendData = {
    title: '',
    dpValue: clarityType,
    mode: 'videoResolution',
    showData: [
      {
        value: 'HD',
        text: Strings.getLang('video_mode_hd'),
        checked: clarityType === 'HD',
      },
      {
        value: 'SD',
        text: Strings.getLang('video_mode_sd'),
        checked: clarityType === 'SD',
      },
    ],
  };
  return sendData;
};

const closeGlobalLoading = () => {
  setTimeout(() => {
    store.dispatch(actions.ipcCommonActions.showPagePreLoading({ showPagePreLoading: false }));
  }, 500);
};
const callTelephoneAlarm = () => {
  const tel = '911';
  Linking.openURL(`tel:${tel}`);
};

const enterFirstRnPage = (id: string, data?: any) => {
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  Popup.close();
  store.dispatch(actions.ipcCommonActions.showCustomDialog({ showCustomDialog: false }));
  store.dispatch(actions.ipcCommonActions.showPopCommon({ showPopCommon: false }));
  TYIpcNative.enterRnPage(id, data);
};

const getPanelTintColor = (key, type) => {
  const state = store.getState();
  const { dpState } = state;
  if (type === 'switch') {
    return dpState[key];
  }
  if (type === 'switchDialog') {
    if (popDataSchema[key]) {
      const { showData } = popDataSchema[key];
      for (let i = 0; i < showData.length; i++) {
        if (showData[i].value === dpState[key]) {
          return showData[i].actived;
        }
      }
      // 防止配置数据出错，添加return false;
      return false;
    }
    return false;
  }
  return false;
};

const getPanelOpacity = key => {
  // 永不禁用的 回放，云存储, 相册
  const neverDisabledPanel = [
    'cloudStorage',
    'generalAlbum',
    'generalTheme',
    'telephone_alarm',
    'customDialogFeat1',
    'rnCustomPage',
  ];

  const state = store.getState();
  const { ipcCommonState } = state;
  const { videoStatus } = ipcCommonState;
  if (neverDisabledPanel.indexOf(key) > -1) {
    return true;
  }
  if (videoStatus !== 6 && videoStatus !== 7) {
    return false;
  }
  return true;
};

export default {
  // 退出设备预览
  backDeviceToList,
  // 跳转一级原生App页面模块
  toggleNativePage,
  // 横竖屏旋转
  setScreenOrientation,
  // 跳转提示正在录像中,请先停止录像
  isRecordingNow,
  // 点击提示正在对讲
  isMicTalking,
  // 提示在录像中不允许切换声音
  isRecordingChangeMute,
  // 录像功能
  enableRecord,
  // 截屏拍照
  snapShoot,
  // 切换喇叭
  enableMute,
  // 切换按宽按高适配
  adjustSize,
  // 判断是否支持云存储
  isSuppportedCloudStorage,
  // 切换视频流或音频
  changeClarityAndAudio,
  // 保存公共pop数据到redux下
  savePopDataToRedux,
  // 自定义Dialog类型
  saveCustomDialogDataToRedux,
  // 切换主题按钮
  changePanelTheme,
  // 切换主题
  changeThemeState,
  // 获取初始化相关配置
  getInitLiveConig,
  // 视频流清晰度类型
  resoultionData,
  // 关闭预置全局Loading
  closeGlobalLoading,
  // 电话报警功能
  callTelephoneAlarm,
  // 从预览跳转一级Rn页面
  enterFirstRnPage,
  // 获取grid菜单图片tintColor值
  getPanelTintColor,
  // 获取grid菜单图片透明度值
  getPanelOpacity,
};

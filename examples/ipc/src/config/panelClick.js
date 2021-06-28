/* eslint-disable max-len */
/* eslint-disable no-lonely-if */
import { Platform } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';
import CameraManager from '../components/nativeComponents/cameraManager';
import { store } from '../main';
import {
  showPopCommon,
  showCustomDialog,
  popData,
  cameraAction,
  enterPlayNativePage,
  isOnLivePage,
} from '../redux/modules/ipcCommon';
import { popDataSchema } from './popDpDataStore';
import {
  enterBackground,
  gotoCameraNewPlaybackPanel,
  gotoCloudStoragePanel,
  isRecordingNow,
  isMicTalking,
  enterRnPage,
  getCuriseStatus,
} from './click';
import Strings from '../i18n';

const isIos = Platform.OS === 'ios';
// eslint-disable-next-line import/prefer-default-export
const enterMultiScreen = () => {
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  CameraManager.gotoMultiCameraPanel();
};
const enterGeneralAlbum = () => {
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  store.dispatch(isOnLivePage({ isOnLivePage: false }));
  if (!isIos) {
    CameraManager.photos();
  } else {
    CameraManager.gotoPhotoLibrary();
  }
};
const enterCruisePage = () => {
  enterRnPage('cruisePage');
};

const enterCloudStorage = () => {
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  store.dispatch(enterPlayNativePage({ enterPlayNativePage: 2 })); // 0 是进入预览 1是进入回放 2是进入云存储
  enterBackground();
  gotoCloudStoragePanel();
};

// 跳转至回放页面(检查回放状态)
const enterPlayback = () => {
  if (isRecordingNow() || isMicTalking()) {
    return false;
  }
  store.dispatch(cameraAction({ cameraAction: 1 }));
  store.dispatch(enterPlayNativePage({ enterPlayNativePage: 1 })); // 0 是进入预览 1是进入回放 2是进入云存储
  enterBackground();
  gotoCameraNewPlaybackPanel();
};

// 跳转至收藏编辑页面
const gotoCruiseDetail = () => {
  if (getCuriseStatus()) {
    CameraManager.showTip(Strings.getLang('ipc_errmsg_memory_point_cruise'));
    return false;
  }
  enterRnPage('pointDetail');
};

// 保存弹出选择框数据到redux,并打开popUp
const savePopDataToRedux = (key, dpValue) => {
  // 获取dpSchema的原始值
  const originDpSchema = filterDpRange(key);
  const { showData, title } = originDpSchema;
  showData.forEach((item, index) => {
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
  store.dispatch(popData({ popData: sendPopData }));
  store.dispatch(showPopCommon({ showPopCommon: true }));
};

// 保存选择功能按键自定义弹出框保存在redux中
const saveCustomDialogDataToRedux = key => {
  const originDialogData = popDataSchema[key];
  const sendPopData = originDialogData;
  store.dispatch(popData({ popData: sendPopData }));
  store.dispatch(showCustomDialog({ showCustomDialog: true }));
};

const filterDpRange = key => {
  const originDpSchema = popDataSchema[key];
  const { showData, title } = originDpSchema;
  // 获取dpRange范围
  const { devInfo } = store.getState();
  const { schema } = devInfo;
  const dpRange = schema[key].range;
  showData.forEach(items => {
    const values = items.value;
    if (dpRange.indexOf(values) === -1) {
      _.remove(showData, item => {
        return item.value === values;
      });
    }
  });
  return {
    showData,
    title,
  };
};

export default {
  enterMultiScreen,
  enterGeneralAlbum,
  enterCruisePage,
  enterCloudStorage,
  enterPlayback,
  gotoCruiseDetail,
  savePopDataToRedux,
  saveCustomDialogDataToRedux,
};

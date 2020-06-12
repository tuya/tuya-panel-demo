/* eslint-disable import/prefer-default-export */
// import CameraManager from '../components/nativeComponents/cameraManager';
import { store } from '../main';
import { popDataSchema } from '../config/popDpDataStore';

// 永不禁用的 回放，云存储, 相册
const neverDisabledPanel = ['cloudStorage', 'multiScreen', 'generalAlbum'];

export const getPanelOpacity = key => {
  const state = store.getState();
  const { ipcCommonState } = state;
  const { showVideoLoad } = ipcCommonState;
  if (neverDisabledPanel.indexOf(key) > -1) {
    return true;
  }
  if (showVideoLoad) {
    return false;
  }
  return true;
};

export const getPanelTintColor = (key, type) => {
  const { dpState } = store.getState();
  const dpValue = dpState[key];
  // 对panel中不同进行分类,对于不同类型的按键，分别做出判断。
  if (type === 'switch') {
    return dpValue;
  } else if (type === 'switchDialog') {
    if (popDataSchema[key]) {
      const { showData } = popDataSchema[key];
      for (let i = 0; i < showData.length; i++) {
        if (showData[i].value === dpValue) {
          return showData[i].actived;
        }
      }
      // 防止配置数据出错，添加return false;
      return false;
    }
    return false;
  } else if (type === 'switchPage') {
    if (key === 'cruise_status') {
      return dpState.cruise_switch;
    }
  } else if (type === 'customDialog') {
    if (key === 'floodlight_switch') {
      return dpState.floodlight_switch;
    } else if (key === 'ipc_lullaby') {
      return dpState.ipc_lullaby_control === '1';
    }
  }
  return false;
};

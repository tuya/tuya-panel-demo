/* eslint-disable import/prefer-default-export */
import { Utils, TYSdk, Dialog, GlobalToast, DeprecatedNavigator } from 'tuya-panel-kit';
import _ from 'lodash';
import { IDevItemFromAPI, EResourceType, IFormatDeviceItem, IRoomItem } from '@interface';
import { categoryList } from '@config';
import Strings from '@i18n';
import { store } from '@models';

export const getFaultStrings = (faultCode: string, faultValue: number, onlyPrior = true) => {
  const { devInfo } = store.getState();
  if (!faultValue) return '';
  const { label } = devInfo.schema[faultCode];
  const labels: string[] = [];
  for (let i = 0; i < label!.length; i++) {
    const value = label![i];
    const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, value));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels.join(', ');
};

export const hexToRgb = (colorVal: string, opacity: number) => {
  let sColor = colorVal.toLowerCase();
  // 十六进制颜色值的正则表达式
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  // 如果是16进制颜色
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    // 处理六位的颜色值
    const sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`, 16));
    }
    return `rgba(${sColorChange.join(',')},${opacity})`;
  }
  return sColor;
};

export const jumpToPage = (id: string, params?: any) => {
  const TYNavigator = TYSdk.Navigator as DeprecatedNavigator;
  TYNavigator.push({
    id,
    ...params,
  });
};

export const back = () => {
  const TYNavigator = TYSdk.Navigator as DeprecatedNavigator;
  TYNavigator.pop();
};

export const alertDialog = (
  title = '',
  onConfirm?: () => void,
  confirmText = Strings.getLang('confirm')
) => {
  Dialog.alert({
    title,
    confirmText,
    onConfirm: (_data, { close }) => {
      typeof onConfirm === 'function' && onConfirm();
      close();
    },
  });
};

export const showToast = (text: string, callback?: () => void) => {
  GlobalToast.show({
    text,
    showIcon: false,
    contentStyle: {},
    onFinish: () => {
      typeof callback === 'function' && callback();
      GlobalToast.hide();
    },
  });
};

export const objCompare = (object, base) => {
  return _.transform(object, (result: any, value, key) => {
    if (!_.isEqual(value, base[key])) {
      result[key] =
        _.isObject(value) && _.isObject(base[key]) ? objCompare(value, base[key]) : value;
    }
  });
};

export const formatVal = (val, compare) => {
  let res = val;
  switch (typeof compare) {
    case 'boolean':
      res = JSON.parse(val);
      break;
    case 'number':
      res = +val;
      break;
    case 'string':
      res = `${val}`;
      break;
    default:
      break;
  }
  return res;
};

// 判断是否是可以显示在中控屏上的设备
export const isValidDevice = (device: IDevItemFromAPI, standPidList: string[]) => {
  const { deviceDisplayShowDetail, resourceType } = device;
  if (resourceType === EResourceType.device) {
    const { quickSwitch, category, productId } = deviceDisplayShowDetail;
    // 如果品类是sp(ipc设备)，或者支持快捷开关。则认为是有效的设备
    if (category === 'sp' || quickSwitch) {
      return true;
    }
    // 检查设备的品类是否在支持的品类类别里，并校验pid是否是支持标准指令集的pid
    return categoryList.includes(category) || standPidList.includes(productId);
  }
  return false;
};

// 把接口返回的设备列表格式化成统一的结构
export const formatDevice = (
  devItem: IDevItemFromAPI,
  roomList: IRoomItem[]
): IFormatDeviceItem | undefined => {
  const { resourceType, resourceId, deviceDisplayShowDetail, groupDisplayShowDetail } = devItem;
  if (resourceType === EResourceType.device) {
    const { devId, iconUrl, category, name, productId, roomId } = deviceDisplayShowDetail;
    const roomName = roomList.find(d => d.roomId === roomId)?.name;
    return {
      devId,
      iconUrl,
      category,
      name,
      productId,
      resourceType,
      resourceId,
      roomId: roomId || 0,
      roomName: roomName || '',
    };
  }
  if (resourceType === EResourceType.group) {
    const { id, icon, category, name, roomId, productId } = groupDisplayShowDetail;
    const roomName = roomList.find(d => d.roomId === roomId)?.name;
    return {
      devId: id,
      iconUrl: icon,
      category,
      name,
      productId,
      resourceType,
      resourceId,
      roomId: roomId || 0,
      roomName: roomName || '',
    };
  }
};

/**
 * 检验dpCode是否是符合继电器开关的命名规范，可根据自己pid的实际情况修改正则表达式
 * 只要dp符合'switch_' 或 'switch' + 任意数字，就认为符合规范，例如 'switch1' 或者 'switch_3'
 */
export const isValidSwitchDp = (dpCode: string) => {
  return /^switch_?\d+/.test(dpCode);
};

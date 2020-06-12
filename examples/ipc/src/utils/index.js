/* eslint-disable no-restricted-syntax */
/* eslint-disable radix */
import { TYSdk } from 'tuya-panel-kit';
import CameraManager from '../components/nativeComponents/cameraManager';
import Global from '../config/global';
import Strings from '../i18n';
import { enterPhoneBackground } from '../config/click';
import Config from '../config';

const { isIOS } = Config;
const TYNative = TYSdk.native;

// 获取时区
export const timezone = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const gt0 = Math.abs(offset);
  let hour = Math.floor(gt0 / 60);
  let minute = gt0 % 60;
  hour = numberToFixed(hour, 2);
  minute = numberToFixed(minute, 2);
  const strHour = `${hour}:${minute}`;
  const zone = offset > 0 ? `-${strHour}` : `+${strHour}`;
  return zone;
};

const numberToFixed = (n, c) => {
  let s = `${Math.abs(n)}`;
  if (s.length < c) {
    s = '0'.repeat(c - s.length) + s;
  } else {
    s = s.slice(-c);
  }
  return n < 0 ? `-${s}` : s;
};

const addZero = val => {
  if (val < 10) {
    return `0${val}`;
  }
  return `${val}`;
};
export const getHourMinute = val => {
  if (val >= 0) {
    const hour = addZero(parseInt(val / 60));
    const minute = addZero(parseInt(val % 60));
    return `${hour}:${minute}`;
  }
  return false;
};

export const convertHourMinute = val => {
  const timerArr = val.split(':');
  const hour = Number(timerArr[0]);
  const minute = Number(timerArr[1]);
  return hour * 60 + minute;
};

// 将具体数值，转换为对应区间百分比
export const numberToPecent = (v, min, max) => {
  if (v === undefined) {
    v = max;
  }
  if (v === 1 && min === 1) {
    return `1%`;
  }
  return `${Math.ceil((100 * (v - min)) / (max - min))}%`;
};

// 将百分比值，转换为对应区间真实数值
export const map01To = (rate, min, max) => parseInt(min + (rate / 100) * (max - min), 10);

// 收藏点排序根据mapId来进行排序

export const sortCollectData = (a, b) => {
  return Number(a.mpId) - Number(b.mpId);
};

export const addZeros = val => {
  if (val < 10) {
    return `0${val}`;
  }
  return `${val}`;
};

// 对Raw型数据 将字符串转为16进制
export const sToHex = str => {
  let val = '';
  for (let i = 0; i < str.length; i++) {
    if (val === '') val = `${str.charCodeAt(i).toString(16)}`;
    // else val += `ox${str.charCodeAt(i).toString(16)}`;
    else val += `${str.charCodeAt(i).toString(16)}`;
  }
  return val;
};

export const sToTen = str => {
  let j;
  const hexes = str.match(/.{1,2}/g) || [];
  let back = '';
  // const reg = new RegExp('[^a-zA-Z0-9_\u4e00-\u9fa5]', 'i');
  for (j = 0; j < hexes.length; j++) {
    const text = String.fromCharCode(parseInt(hexes[j], 16));
    back += text;
  }
  return back;
};

// 请求超时通用接口处理
// timeOutTime 为自己设定的超时秒数
export const requestTimeout = (timeOutTime = 10000) => {
  Global.requestTimeOut = setTimeout(() => {
    TYNative.hideLoading();
    CameraManager.showTip(Strings.getLang('requestTimeOutErr'));
  }, timeOutTime);
};

export const cancelRequestTimeOut = () => {
  clearTimeout(Global.requestTimeOut);
};

// timeOutTime 判定进入后台5秒后主动断开P2P
export const enterBackTimeOut = (timeOutTime = 5000) => {
  // 安卓进入后台，先立马断开,安卓rn机制如此,进入后台会停止所有的定时;
  !isIOS && enterPhoneBackground();
  if (isIOS) {
    Global.enterBackTimeOut = setTimeout(() => {
      enterPhoneBackground();
    }, timeOutTime);
  }
};

export const cancelEnterBackTimeOut = () => {
  clearTimeout(Global.enterBackTimeOut);
};

// es6数组去重
export const uniqueArr = arr => {
  return Array.from(new Set(arr));
};

// 根据order进行排序，自定义功能点配置排序；
export const sortPanelConfigData = (a, b) => {
  return Number(a.order) - Number(b.order);
};

export const camelize = str => {
  if (typeof str === 'number') {
    return `${str}`;
  }
  const ret = str.replace(/[-_\s]+(.)?/g, (match, chr) => (chr ? chr.toUpperCase() : ''));
  // Ensure 1st char is always lowercase
  return ret.substr(0, 1).toLowerCase() + ret.substr(1);
};

export const formatUiConfig = devInfo => {
  const uiConfig = devInfo.uiConfig ? { ...devInfo.uiConfig } : {};

  Object.keys(devInfo.schema).forEach(itKey => {
    const dps = devInfo.schema[itKey];
    const strKey = `dp_${dps.code}`;
    const key = camelize(strKey);
    uiConfig[key] = {
      key,
      strKey: strKey.toLowerCase(),
      code: dps.code,
      attr: {},
      attri: {},
    };

    switch (dps.type) {
      case 'enum':
        dps.range.forEach(it => {
          const k = `${strKey}_${it}`.toLowerCase();
          uiConfig[key].attr[it] = k;
          uiConfig[key].attri[k] = it;
        });
        break;
      case 'bool':
        {
          const on = `${strKey}_on`.toLowerCase();
          const off = `${strKey}_off`.toLowerCase();
          uiConfig[key].attr = {
            false: off,
            true: on,
          };
          uiConfig[key].attri = {
            [`${strKey}_off`.toLowerCase()]: false,
            [`${strKey}_on`.toLowerCase()]: true,
          };
        }
        break;
      case 'bitmap':
        for (const v of dps.label) {
          const k = `${strKey}_${v}`.toLowerCase();
          uiConfig[key].attr[v] = k;
          uiConfig[key].attri[k] = v;
        }
        break;

      default:
        break;
    }
  });

  if (!devInfo.panelConfig || !devInfo.panelConfig.bic) return uiConfig;

  const { bic } = devInfo.panelConfig;

  for (const i in bic) {
    if (Object.prototype.hasOwnProperty.call(bic, i)) {
      const key = camelize(`panel_${bic[i].code}`);
      if (bic[i].selected === true) {
        uiConfig[key] = bic[i].value ? parseJson(bic[i].value) : true;
      } else {
        uiConfig[key] = false;
      }
    }
  }
  return uiConfig;
};

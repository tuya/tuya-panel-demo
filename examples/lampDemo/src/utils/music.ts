import { NativeModules } from 'react-native';
import dragon from '@tuya-rn/tuya-native-dragon';
import _ from 'lodash';
import { TYSdk } from 'tuya-panel-kit';
import { SupportUtils, ColorUtils } from '@tuya-rn/tuya-native-lamp-elements/lib/utils';
import { ControlData } from '@tuya-rn/tuya-native-dragon/lib/extension/lamp/format/ControlFormater';
import DpCodes from '@config/dpCodes';

type Type = 'checking' | 'failure' | 'success' | 'close';

const DeviceEvent = TYSdk.DeviceEventEmitter;
const TYPublicNative = NativeModules.TYRCTMusicManager;
const { musicCode } = DpCodes;
let isListening = false;
let isSendEanbled = true;
let timeOutTimer: number;
const listenters: {
  opening?: Function[];
  failure?: Function[];
  success?: Function[];
  close?: Function[];
} = {};

const fireEvent = (type: Type) => {
  if (listenters[type]) {
    listenters[type].forEach(cb => {
      cb();
    });
  }
};

const handleTimeOut = () => {
  return setTimeout(() => {
    // 10秒内未有音源输入, 调用检测中事件
    fireEvent('checking');
    // 30 秒内没有音源输入，则调用失事件，并主动停止监听
    timeOutTimer = setTimeout(() => {
      close(false);
      fireEvent('failure');
    }, 30000);
  }, 10000);
};

const handleSuccess = _.throttle(() => {
  fireEvent('success');
}, 1000);

export const addListener = (type: Type, cb) => {
  if (!listenters[type]) {
    listenters[type] = [];
  }
  listenters[type].push(cb);
};
export const removeListener = (type: Type, cb) => {
  if (listenters[type]) {
    const index = listenters[type].indexOf(cb);
    if (index >= 0) {
      listenters[type].splice(index, 1);
    }
  }
};

export const handleAudioRgbChange = (
  { R, G, B, C: temp, L: bright, index }: any,
  musicOption: any,
  musicCallback: any
) => {
  clearTimeout(timeOutTimer);
  timeOutTimer = handleTimeOut();
  handleSuccess();
  let hue = 0;
  let saturation = 0;
  let value = 0;
  let brightness = 0;
  let temperature = 0;

  const { mode, colorArea } = musicOption;

  if (SupportUtils.isSupportColour()) {
    [hue, saturation, value] = ColorUtils.rgb2hsb(R, G, B).map((v, i) => (i > 0 ? v * 10 : v));
  } else {
    // 是否支持白光音乐功能
    if (typeof bright === 'undefined' || typeof temp === 'undefined') {
      return;
    }
    brightness = bright * 10;
    temperature = temp * 10;
    if (!SupportUtils.isSupportTemp()) {
      temperature = 1000;
    }
  }

  if (colorArea) {
    colorArea.forEach(({ area, hue: h, saturation: s, value: v }: any) => {
      const [left, right] = area;
      if (index >= left && index <= right) {
        hue = h;
        saturation = s;
        value = v;
      }
    });
  }

  const musicData = {
    mode,
    hue: Math.round(hue),
    saturation: Math.round(saturation),
    value: Math.round(value),
    brightness,
    temperature,
  };

  musicCallback(musicData, index || 5);

  if (isListening && isSendEanbled) {
    dragon.putDpData(
      {
        [musicCode]: musicData as ControlData,
      },
      {
        useThrottle: true,
        checkCurrent: true,
      }
    );
  }
};

const startVoice = () =>
  new Promise((resolve, reject) => {
    try {
      TYPublicNative.startVoice(resolve, reject);
      TYSdk.native.screenAlwaysOn(true);
    } catch (err) {
      reject(err);
    }
  });

const stopVoice = () =>
  new Promise((resolve, reject) => {
    try {
      TYPublicNative.stopVoice(resolve, reject);
      TYSdk.native.screenAlwaysOn(false);
    } catch (err) {
      reject(err);
    }
  });

/**
 * 开启麦克风，并开始监听
 */
export const open = async (musicOption: any, musicCallback: any) => {
  if (isListening) {
    return Promise.resolve();
  }
  if (!isSendEanbled) {
    resume();
  } else {
    try {
      DeviceEvent.addListener('audioRgbChange', (musicData: any) =>
        handleAudioRgbChange(musicData, musicOption, musicCallback)
      );
      // 开启麦克风
      await startVoice();
      // 保持屏幕
      TYSdk.native.screenAlwaysOn(true);
      isListening = true;
      isSendEanbled = true;
    } catch (e) {
      return Promise.reject(e);
    }
  }
};

/**
 * 关闭麦克风
 */
export const close = async (needFire = true) => {
  if (!isListening) {
    return Promise.resolve();
  }
  handleSuccess.cancel();
  clearTimeout(timeOutTimer);
  needFire && fireEvent('close');
  isListening = false;
  isSendEanbled = true;
  try {
    DeviceEvent.removeAllListeners('audioRgbChange');
    // 关掉麦克风
    await stopVoice();
    // 关掉保持屏幕
    TYSdk.native.screenAlwaysOn(false);
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * 暂停下发
 */
export const pause = () => {
  handleSuccess.cancel();
  isSendEanbled = false;
};

/**
 * 继续下发
 */
export const resume = () => {
  isSendEanbled = true;
};

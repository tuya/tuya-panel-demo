/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import { TYSdk } from 'tuya-panel-kit';
import { NativeModules } from 'react-native';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import _ from 'lodash';
import { SupportUtils, ColorUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import dpCodes from '@config/dpCodes';
import { IControlData } from '@types';

type Type = 'checking' | 'failure' | 'success' | 'close';

const TYNative = TYSdk.native;
const DeviceEvent = TYSdk.DeviceEventEmitter;
const TYPublicNative = NativeModules.TYRCTMusicManager;

const { musicCode } = dpCodes;
let isListening = false;
let isSendEanbled = true;
let timeOutTimer: number;
const listenters: {
  opening?: any;
  failure?: any;
  success?: any;
  close?: any;
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

export const addListener = (type: Type, cb: any) => {
  // @ts-ignore
  if (!listenters[type]) {
    // @ts-ignore
    listenters[type] = [];
  }
  // @ts-ignore
  listenters[type].push(cb);
};
export const removeListener = (type: Type, cb: any) => {
  // @ts-ignore
  if (listenters[type]) {
    // @ts-ignore
    const index = listenters[type].indexOf(cb);
    if (index >= 0) {
      // @ts-ignore
      listenters[type].splice(index, 1);
    }
  }
};

export const handleAudioRgbChange = _.throttle(
  ({ R, G, B, C: temp, L: bright, index }: any, musicOption: any, musicCallback: any) => {
    if (!isListening) {
      return;
    }
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
      [hue, saturation, value] = ColorUtils.rgb2hsb(R, G, B);
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
      saturation: Math.round(saturation * 10),
      value: Math.round(value * 10),
      brightness,
      temperature,
    };

    musicCallback(musicData, index || 5);

    if (isSendEanbled) {
      dragon.putDpData(
        {
          [musicCode]: musicData as IControlData,
        },
        {
          checkCurrent: false,
        }
      );
    }
  },
  300,
  { leading: false }
);

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
      await TYPublicNative.startVoice(
        (d: any) => {
          // 保持屏幕
          TYNative.screenAlwaysOn(true);
          Promise.resolve(d);
        },
        (err: any) => {
          Promise.reject(err);
        }
      );
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
  isListening = false;
  handleSuccess.cancel();
  handleAudioRgbChange && handleAudioRgbChange.cancel();
  clearTimeout(timeOutTimer);
  needFire && fireEvent('close');
  isSendEanbled = true;
  try {
    DeviceEvent.removeAllListeners('audioRgbChange');
    // 关掉麦克风
    await TYPublicNative.stopVoice(
      (d: any) => {
        // 关掉保持屏幕
        TYNative.screenAlwaysOn(false);
        Promise.resolve(d);
      },
      (err: any) => {
        Promise.reject(err);
      }
    );
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

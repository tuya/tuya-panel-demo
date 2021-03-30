/* eslint-disable import/prefer-default-export */
import { TYSdk, Utils } from 'tuya-panel-kit';
import ColorObj from 'color';
import { store } from '../models';
import Strings from '../i18n';

interface SceneValueData {
  t: number; // 时长
  f: number; // 频率
  m: number; // 模式
  h: number; // 彩光色相
  s: number; // 彩光饱和度
  v: number; // 彩光亮度
  b: number; // 白光亮度
  k: number; // 白光色温
}

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

const { color: ColorUtils } = Utils.ColorUtils;

let sendMusicEnabled = false;

export const musicEnabled = () => {
  sendMusicEnabled = true;
};
export const musicDisabled = () => {
  sendMusicEnabled = false;
};

export const isSendMusicEnabled = () => {
  return sendMusicEnabled;
};

class Parser {
  format(value: string, len = 2) {
    let v = `${value}`;
    if (v.length < len) {
      v = '0'.repeat(len - v.length) + v;
    } else {
      v = v.slice(0, len);
    }
    return v;
  }

  /**
   * @desc 将10进制的hsv转换成16进制的hhsssvvvv
   * 范围为h(0-360) s(0-1000) v(0-1000)
   * @param {Array} hsvArr - [h, s, v]
   *
   * @return {String} 'hhhhssssvvvv'
   *
   */
  encodeColorData(h: number, s: number, v: number): string {
    let hue = h % 360;
    hue = hue > 0 ? hue : h;
    hue = hue < 0 ? 360 + hue : hue;

    return [hue, s, v].reduce((curr: string, next: number) => {
      let hex = parseInt(`${next}`, 10).toString(16);
      hex = this.format(hex, 4);
      return curr + hex;
    }, '');
  }

  // t: time; f: frequence; m: sceneMode=[0,1,2];
  // h: hue; s: saturation; v: lightValue; b: whiteBright; k: kelvin
  encodeSceneData(scenes: SceneValueData[], sceneNum: number) {
    const scenesValue = scenes.reduce((sum: string, seconde: SceneValueData) => {
      const { t, f, m, h = 0, s = 0, v = 0, b = 0, k = 0 } = seconde;
      const tfm = [t, f, m].reduce((total: string, next: number) => {
        let cur = parseInt(`${next}`, 10).toString(16);
        cur = this.format(cur, 2);
        return total + cur;
      }, '');
      const hsvbk = [h, s, v, b, k].reduce((total: string, next: number) => {
        let cur = parseInt(`${next}`, 10).toString(16);
        cur = this.format(cur, 4);
        return total + cur;
      }, '');
      return sum + tfm + hsvbk;
    }, '');
    return this.format(`${sceneNum}`, 2) + scenesValue;
  }

  // m: mode; h: hue; s: saturation; v: lightValue; b: whiteBright; k: kelvin;
  // mode: 0 - 跳变; 1 - 呼吸;
  encodeControlData(m: number, h: number, s: number, v: number, b: number, k: number) {
    const hsvbk = [h, s, v, b, k].reduce((total: string, next: number) => {
      let cur = parseInt(`${next}`, 10).toString(16);
      cur = this.format(cur, 4);
      return total + cur;
    }, '');
    return m + hsvbk;
  }

  // m: mode; h: hue; s: saturation; v: lightValue;
  // mode: 0 - 跳变; 1 - 呼吸;
  encodeSigmeshControlData(m: number, h: number, s: number, v: number) {
    const hsv = [h, s, v].reduce((total: string, next: number, index: number) => {
      let cur = parseInt(`${next}`, 10).toString(16);
      cur = this.format(cur, index === 0 ? 4 : 2);
      return total + cur;
    }, '');
    return `80${hsv}`;
  }

  /**
   * @desc 将16进制的hhsssvvv转换成10进制的hsv
   * 范围为h(0-360) s(0-1000) v(0-1000)
   * @param {String} hsvStr - encoded hsvStr (hhhhssssvvvv)
   *
   * @return {Array} [h, s, v]
   *
   */
  decodeColorData(byte: string) {
    if (!byte || byte.length !== 12) {
      return [0, 1000, 1000];
    }
    const b = byte.match(/[a-z\d]{4}/gi) || [];
    return b.reduce((curr: number[], hex: string) => {
      curr.push(parseInt(hex, 16));
      return curr;
    }, []);
  }

  decodeSceneData(byte: string) {
    if (!byte || (byte.length - 2) % 26 !== 0) {
      return {
        sceneNum: 0,
        scenes: [],
      };
    }
    const sceneNum = byte.slice(0, 2);
    const sceneValueArr = byte.slice(2).match(/[a-z\d]{26}/gi) || [];
    const scenes = sceneValueArr.map((item: string) => {
      const tfm = item.slice(0, 6);
      const [t, f, m] = (tfm.match(/[a-z\d]{2}/gi) || []).map(v => parseInt(v, 16));
      const hsvbk = item.slice(6);
      const [h, s, v, b, k] = (hsvbk.match(/[a-z\d]{4}/gi) || []).map(d => parseInt(d, 16));
      return { t, f, m, h, s, v, b, k };
    });
    return {
      sceneNum: parseInt(sceneNum, 16),
      scenes,
    };
  }

  bright2Opacity(brightness: number, option = { min: 0.3, max: 1 }) {
    const { min = 0.3, max = 1 } = option;
    return Math.round((min + ((brightness - 10) / (1000 - 10)) * (max - min)) * 100) / 100;
  }

  /**
   * 格式化hsv
   * 亮度将转化为透明度变化
   */
  hsv2rgba(hue: number, saturation: number, bright: number) {
    let color = ColorUtils.hsb2hex(hue, saturation / 10, 100);
    color = new ColorObj(color).alpha(this.bright2Opacity(bright)).rgbString();
    return color;
  }

  brightKelvin2rgba(bright: number, kelvin: number) {
    let color = ColorUtils.brightKelvin2rgb(1000, kelvin);
    color = new ColorObj(color).alpha(this.bright2Opacity(bright)).rgbString();
    return color;
  }
}

export const ColorParser = new Parser();

export const calcPercent = (start: number, end: number, pos: number, min = 0) => {
  const distance = end - start;
  const diff = pos - start;
  return (diff / distance) * (1 - min) + min;
};

export const calcPosition = (start: number, end: number, percent: number) => {
  const distance = end - start;
  return percent * distance + start;
};

export const randomHsb = () => {
  const random = (min: number, max: number) => {
    let x = max;
    let y = min;
    if (x < y) {
      x = min;
      y = max;
    }
    return Math.random() * (x - y) + y;
  };
  return [random(0, 360), 100, 100];
};

export const arrayToObject = (arr: any[]) => {
  if (arr.length === 0) {
    return {};
  }
  return Object.assign({}, ...arr);
};

export const isCapability = (id: number) => {
  return (TYSdk.devInfo.capability & (1 << id)) > 0; // eslint-disable-line no-bitwise
};

/* eslint-disable */
import { Utils } from 'tuya-panel-kit';
import camelCase from 'lodash/camelCase';
import ColorObj from 'color';

const { color: colorInstance } = Utils.ColorUtils;

export const createClassBaseByInstance = instance => {
  class BaseClass {}
  BaseClass.prototype = Object.getPrototypeOf(instance);

  return BaseClass;
};

const ColorBase = createClassBaseByInstance(colorInstance);

function toFixed16(v, length = 2) {
  let d = parseInt(v, 10).toString(16);
  if (d.length < length) {
    d = '0'.repeat(length - d.length) + d;
  } else {
    d = d.slice(0, length);
  }
  return d;
}

export const memorize = fn => {
  const toStr = Object.prototype.toString;
  const isCallable = fn => typeof fn === 'function' || toStr.call(fn) === '[object Function]';

  const isValid = value => typeof value !== 'undefined';

  if (!isCallable(fn)) {
    throw new TypeError('memorize: when provided, the first argument must be a function');
  }
  const cache = {};
  return function (...args) {
    if (args.length < 1) {
      throw new TypeError('memorize: arguments cannot be null or undefined');
    }
    const str = JSON.stringify(args);
    cache[str] = (isValid(cache[str]) && cache[str]) || fn.apply(fn, args);

    return cache[str];
  };
};

/**
 * 值转化为标准百分比。
 * @param {Number} value
 * @param {Number} min
 * @param {Number} max
 * @param {Object} options { minPercent, reverse }
 *
 * @returns {Number} percent 0-100
 */
export const standardValue2Percent = memorize(
  (v, min = 0, max = 1000, { minPercent = 0, reverse = false } = {}) => {
    v = v > max ? max : v < min ? min : v;
    if (reverse) {
      v = max - (v - min);
    }
    const percent = Math.round(((v - min) / (max - min)) * (100 - minPercent) + minPercent);
    return percent;
  }
);

// 百分比转化为实际对应值。
export const standardPercent2Value = memorize((v, min = 0, max = 1000) => {
  const value = Math.round(((max - min) * v) / 100 + min);
  return value;
});

class Color extends ColorBase {
  /**
   * 构造Color工具类，通过白光，彩光schema,搞得有点复杂了。
   * @param {Object} schema
   */
  constructor(
    schema = {
      whiteBright: {
        min: 10,
        max: 1000,
        minPercent: 1,
        length: 4,
      },
      whiteKelvin: {
        min: 0,
        max: 1000,
        minPercent: 0,
        length: 4,
      },
      colourBrightness: {
        min: 10,
        max: 1000,
        length: 4,
      },
      sceneBrigheness: {
        min: 10,
        max: 1000,
        length: 4,
      },
    }
  ) {
    super();
    this.setSchema(schema);
  }

  setSchema(schema) {
    Object.entries(schema).forEach(([preKey, schemaObj]) => {
      Object.entries(schemaObj).forEach(([nextKey, nextValue]) => {
        const curKey = camelCase([preKey, nextKey]);
        this[curKey] = nextValue;
      });
    });
  }

  /**
   *
   * @param {*} hex
   */
  hex2colourData(hex) {
    const hsv = super.hex2hsv(hex);
    return this.encodeColourData(...hsv);
  }

  hsv2hex(h, s, v) {
    return super.hsv2hex(h, s / 10, v / 10);
  }

  colourData2hex(value) {
    const [h, s, v] = this.decodeColourData(value);
    return this.hsv2hex(h, s, v);
  }

  // kelvi => rgb => hsv
  brightKelvin2rgb(
    bright = 1000,
    kelvin,
    { temperatureMin = 4000, temperatureMax = 8000, isThousand = true } = {}
  ) {
    if (isThousand) {
      bright /= 10;
      kelvin /= 10;
    }
    const temp = temperatureMin + ((temperatureMax - temperatureMin) * kelvin) / 100;
    const hsv = super.rgb2hsv(...super.kelvin2rgb(temp));
    const brightV = bright;
    hsv[2] = brightV;
    return super.hsv2RgbString(...hsv);
  }

  /**
   * 面板内部使用0-100，转换为实际输出下发。
   * @param {Number} percent 0-100
   * @returns 输出给下发，给设备(0-255|0-1000)
   */
  encodeWhiteBright(percent) {
    const value = standardPercent2Value(percent, 0, this.whiteBrightMax, {
      minPercent: 0,
    });
    return value;
  }

  encodeWhiteKelvin(percent) {
    const value = standardPercent2Value(percent, this.whiteKelvinMin, this.whiteKelvinMax, {
      minPercent: this.whiteKelvinMinPercent,
    });
    return value;
  }

  /**
   *
   * @param { Number } value 实际的下发到设备的值 (0-255|0-1000)
   * @returns { Number } 输出给面板的使用值 0-100
   */
  decodeWhiteBright(value) {
    const percent = standardValue2Percent(value);
    return percent;
  }

  decodeWhiteKelvin(value) {
    const percent = standardValue2Percent(value);
    return percent;
  }

  /**
   * @desc 将10进制的hsv转换成16进制的hhsssvvvv
   * 范围为h(0-360) s(0-1000) v(0-1000)
   * @param {Array} hsvArr - [h, s, v]
   *
   * @return {String} 'hhhhssssvvvv'
   *
   */
  encodeColourData(h, s, v) {
    let hue = h % 360;
    hue = hue > 0 ? hue : h;
    hue = hue < 0 ? 360 + hue : hue;
    const res = [hue, s, v].reduce((total, cur, idx) => total + toFixed16(cur, 4), '');
    return res;
  }

  /**
   * @desc 将16进制的hhsssvvv转换成10进制的hsv
   * 范围为h(0-360) s(0-1000) v(0-1000)
   * @param {String} hsvStr - encoded hsvStr (hhhhssssvvvv)
   *
   * @return {Array} [h, s, v]
   *
   */
  decodeColourData(byte) {
    if (!byte) {
      byte = '016803e803e8';
    }
    const hue = parseInt(byte.slice(0, 4), 16);

    const [s, v] = (byte.slice(4).match(/[a-z|0-9]{4}/gi) || []).reduce((total, cur) => {
      total.push(parseInt(cur, 16));
      return total;
    }, []);
    return [hue, s, v];
  }

  encodeSceneValue([num, speed, mode, ...hsvbks] = []) {
    const time = speed;
    const colors = hsvbks
      .map(([h, s, v, b, k]) => {
        const hue = toFixed16(h, 4);
        const saturation = toFixed16(s, 4);
        const brightness = toFixed16(v, 4);
        const whiteBright = toFixed16(b, 4);
        const kelvin = toFixed16(k, 4);
        const tsm = [time, speed, mode].map(item => toFixed16(item, 2));
        return [...tsm, hue, saturation, brightness, whiteBright, kelvin].join('');
      })
      .join('');
    return toFixed16(num, 2) + colors;
  }

  /**
   *
   * @param { String } value
   *
   * @returns [num, speed, mode, ...hsvbks]
   *
   */
  decodeSceneValue(value) {
    if (!value) {
      return [0, 0, 0, [360, 1000, 1000, 1000, 1000]];
    }
    function* genSliceValue(value) {
      let start = 0;
      let end = 0;
      let step = 0;
      const { length } = value;
      while (start < length) {
        if (end > length) {
          console.warn('end > length', value, value.length);
        }
        step = yield value.slice(start, end);
        start = end;
        end += step;
      }
    }

    const gen = genSliceValue(value);
    gen.next();
    const next16 = (step, decode = _ => _) => decode(parseInt(gen.next(step).value, 16));

    const runUnit = () => {
      const time = next16(2);
      const speed = next16(2);
      const mode = next16(2);

      const hue = next16(4);
      const saturation = next16(4);
      const lightness = next16(4);
      const bright = next16(4);
      const kelvin = next16(4);
      return [time, speed, mode, hue, saturation, lightness, bright, kelvin];
    };
    const unitLength = 26;

    const num = next16(2);
    const dataStr = value.slice(2);
    const iteratorTime = dataStr.length / unitLength;
    let datas = [];
    for (let index = 0; index < iteratorTime; index++) {
      const [time, speed, mode, ...hsvbk] = runUnit();
      if (index === 0) {
        datas = datas.concat([time, speed, mode, hsvbk]);
      } else {
        datas = datas.concat([hsvbk]);
      }
    }

    const [time, speed, mode, ...hsvbks] = datas;

    return [num, speed, mode, ...hsvbks];
  }

  encodeControlData(h, s, v, b, k) {
    const hsvbk = [h, s, v, b, k].reduce((total, next) => total + toFixed16(next, 4), '');
    return `0${hsvbk}`;
  }

  encodeWhiteControlData(bright, kelvin, { isThousand = true } = {}) {
    if (!isThousand) {
      bright *= 10;
      kelvin *= 10;
    }
    return this.encodeControlData(0, 0, 0, bright, kelvin);
  }

  encodeColourControlData(h, s, v, { isThousand = true } = {}) {
    if (!isThousand) {
      s *= 10;
      v *= 10;
    }
    const hsv = this.encodeColourData(h, s, v);
    return `0${hsv}00000000`;
  }

  bright2Opacity(brightness, option = { min: 0.2, max: 1 }) {
    const { min = 0.2, max = 1 } = option;
    return Math.round((min + ((brightness - 10) / (1000 - 10)) * (max - min)) * 100) / 100;
  }

  /**
   * 格式化hsv
   * 亮度将转化为透明度变化
   */
  hsv2rgba(hue, saturation, bright) {
    let color = colorInstance.hsb2hex(hue, saturation / 10, 100);
    color = new ColorObj(color).alpha(this.bright2Opacity(bright)).rgbString();
    return color;
  }
  brightKelvin2rgba(bright, kelvin) {
    let color = this.brightKelvin2rgb(1000, kelvin);
    color = new ColorObj(color).alpha(this.bright2Opacity(bright)).rgbString();
    return color;
  }
}
export default new Color();

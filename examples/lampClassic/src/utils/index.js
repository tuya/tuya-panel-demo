import _throttle from 'lodash/throttle';
import Color from './color';

const syncThrottle = (sync, throttleCall, wait = 300) => {
  const throttleFn = throttle(throttleCall, wait);

  const fn = (...args) => {
    sync(...args);
    throttleFn(...args);
  };

  fn.flush = throttleFn.flush;
  fn.cancel = throttleFn.cancel;
  return fn;
};

function calculateSceneColor(sceneData) {
  const [, , , ...hsvbks] = Color.decodeSceneValue(sceneData);
  const colors = [];
  const brights = [];
  hsvbks.forEach(([h, s, v, b, k]) => {
    const isWhite = !!(b || k);
    if (isWhite) {
      brights.push(b);
      colors.push(Color.brightKelvin2rgb(1000, k));
    } else {
      brights.push(v);
      colors.push(Color.hsv2hex(h, s, 1000));
    }
  });
  return { bright: average(brights), color: colors };
}

/**
 * 节流函数
 * 回调方法执行时，会以当前最新的数据来执行，即若在回调方法未被执行前，连续调用了节流函数，则在节流时间到达后，会以最新的数据执行回调方法
 * @param {function} fn 回调方法
 * @param {*} time 节流时间
 */
const throttle = (callback, waitTime = 300) => _throttle(callback, waitTime);

const debounce = (callback, waitTime = 300) => _throttle(callback, waitTime);

export const arrayToObject = arr => {
  if (arr.length === 0) {
    return {};
  }
  return Object.assign(...arr);
};

// 通讯类型判断
export const isCapability = (id, capability) => (capability & (1 << id)) > 0; // eslint-disable-line no-bitwise

export const handleFifthSceneColor = (h, s, v) => [
  [h, s, v, 0, 0],
  [h, s, Math.max(10, Math.round(v * 0.01)), 0, 0],
];

export const formatBrightPercent = (value, { min = 10, max = 1000, minPercent = 1 } = {}) => {
  return Math.round(((100 - minPercent) * (value - min)) / (max - min) + minPercent);
};

export { calculateSceneColor, syncThrottle, throttle, debounce };

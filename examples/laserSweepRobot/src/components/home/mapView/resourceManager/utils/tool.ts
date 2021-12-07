import _ from 'lodash';

/**
 * 节流方法
 * @param fn
 * @param threshold 节流时间
 * @param scope
 */
export const throttle = (fn, threshold: number, scope = this) => {
  let timer;
  let prev = Date.now();
  return function() {
    const context = scope || this,
      args = arguments;
    const now = Date.now();
    if (now - prev > threshold) {
      prev = now;
      fn.apply(context, args);
    }
  };
};

/**
 * 深合并config
 * @param targetConifg
 * @param sourceConfig
 */
export const mergeConifg = (targetConifg, sourceConfig) => {
  const newConfig = _.mergeWith(targetConifg, sourceConfig, (curValue, srcValue) => {
    if (_.isArray(curValue)) {
      // return curValue = srcValue);
      return curValue;
    }
  });
  return newConfig;
};

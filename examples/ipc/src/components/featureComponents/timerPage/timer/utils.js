/* eslint-disable camelcase */
const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const tuya_panel_kit_1 = require('tuya-panel-kit');
const i18n_1 = __importDefault(require('./i18n'));

exports.parseJSON = str => {
  let rst;
  if (str && {}.toString.call(str) === '[object String]') {
    // 当JSON字符串解析
    try {
      rst = JSON.parse(str);
    } catch (e) {
      // 出错，用eval继续解析JSON字符串
      try {
        // eslint-disable-next-line
        rst = eval(`(${str})`);
      } catch (e2) {
        // 当成普通字符串
        rst = str;
      }
    }
  } else {
    rst = typeof str === 'undefined' ? {} : str;
  }
  return rst;
};
exports.parseHour12 = time => {
  const t = tuya_panel_kit_1.Utils.TimeUtils.parseHour12(time);
  return t
    .split(' ')
    .reverse()
    .join(' ');
};
exports.GetRepeatStr = source => {
  if (!source) return '';
  const days = [];
  let repeat = '';
  source.split('').map((item, index) => {
    if (item === '1') {
      days.push(i18n_1.default.getLang(`day${index}`));
    }
  });
  if (days.length === 0) {
    repeat = i18n_1.default.getLang('dayOnce');
  } else if (days.length === 7) {
    repeat = i18n_1.default.getLang('dayEvery');
  } else if (days.length === 5 && source.substring(1, 6) === '11111') {
    repeat = i18n_1.default.getLang('weekDays');
  } else if (days.length === 2 && source.startsWith('1') && source.endsWith('1')) {
    repeat = i18n_1.default.getLang('weekend');
  } else {
    repeat = days.join(' ');
  }
  return repeat;
};
exports.TransformRepeat = source => {
  let repeatLoop = parseInt(source, 16).toString(2);
  if (repeatLoop.length < 7) {
    const zeroPlus = '0'.repeat(7 - repeatLoop.length);
    repeatLoop = `${zeroPlus}${repeatLoop}`;
  }
  return repeatLoop;
};

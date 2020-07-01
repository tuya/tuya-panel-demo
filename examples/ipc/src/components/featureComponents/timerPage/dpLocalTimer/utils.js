/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-lonely-if */
/* eslint-disable no-undef */
/* eslint-disable camelcase */
import _ from 'lodash';

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

// dp定时根据系统手机是否为12小时制,转化展示的时间
exports.getFormatTime = (time, is12Hours) => {
  let str = time;
  if (time.includes('~')) {
    const startTime = time.split('~')[0];
    const endTime = time.split('~')[1];
    const hourStart = Number(startTime.split(':')[0]);
    const minuteStart = endTime.split(':')[1];
    const hourEnd = Number(endTime.split(':')[0]);
    const minuteEnd = endTime.split(':')[1];
    const showTomrrow = hourEnd <= hourStart && Number(minuteEnd) <= Number(minuteStart);
    showTomrrow
      ? (str = `${startTime} ~ ${i18n_1.default.getLang('tomorrow')} ${endTime}`)
      : (str = `${startTime} ~ ${endTime}`);
    if (is12Hours) {
      showTomrrow
        ? (str = `${getTimeStr(hourStart, minuteStart)} ~ ${i18n_1.default.getLang(
            'tomorrow'
          )} ${getTimeStr(hourEnd, minuteEnd)}`)
        : (str = `${getTimeStr(hourStart, minuteStart)} ~ ${getTimeStr(hourEnd, minuteEnd)}`);
    }
  } else {
    // 其它默认为单项定时
    if (is12Hours) {
      const hour = Number(time.split(':')[0]);
      const minute = time.split(':')[1];
      str = getTimeStr(hour, minute);
    }
  }
  return str;
};

const getTimeStr = (hour, minute) => {
  const timerString =
    hour > 12
      ? `${i18n_1.default.getLang('pm')} ${addBeforetimeZero(hour - 12)}:${addBeforetimeZero(
          minute
        )}`
      : `${i18n_1.default.getLang('am')} ${addBeforetimeZero(hour)}:${addBeforetimeZero(minute)}`;
  return timerString;
};

// 补零
const addBeforetimeZero = number => {
  if (number < 10) {
    return `0${number}`;
  }
  return number;
};

// 补零
exports.addBeforetimeZeros = number => {
  if (Number(number) < 10) {
    return `0${number}`;
  }
  return number;
};

// 获取taskArr的值
exports.getTaskDpStr = (showdata, dataSource) => {
  const sendDpStr = [];
  showdata.forEach((item, itemIndex) => {
    dataSource.forEach((o, oIndex) => {
      if (o.dp === item.dp) {
        if (o.type !== 'value') {
          const newSelected = _.findIndex(o.selectedValue, selected => {
            return selected.value === item.value;
          });
          sendDpStr.push(`${dataSource[oIndex].dpName}: ${o.selectedValue[newSelected].name}`);
        } else {
          sendDpStr.push(`${dataSource[oIndex].dpName}: ${item.value}${o.unit}`);
        }
      }
    });
  });
  return sendDpStr;
};

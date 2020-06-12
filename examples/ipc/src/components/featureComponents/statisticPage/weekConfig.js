/* eslint-disable import/prefer-default-export */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable radix */
import moment from 'moment';
import Strings from '../../../i18n';

const getCurrentWeek = () => {
  const start = moment()
    .weekday(1)
    .format('YYYYMMDD'); // 本周一
  const end = moment()
    .weekday(7)
    .format('YYYYMMDD'); // 本周日
  return [start, end];
};

const getLastWeek = i => {
  // 计算今天是这周第几天
  const weekOfDay = parseInt(moment().format('E'));
  // 周一日期
  const last_monday = moment()
    .subtract(weekOfDay + 7 * i - 1, 'days')
    .format('YYYYMMDD');
  // 周日日期
  const last_sunday = moment()
    .subtract(weekOfDay + 7 * (i - 1), 'days')
    .format('YYYYMMDD');
  return [last_monday, last_sunday];
};

export const weekData = [
  {
    weekName: Strings.getLang('ipc_statisics_page_thisWeek'),
    weekStartTime: getCurrentWeek()[0],
    weekEndTime: getCurrentWeek()[1],
  },
  {
    weekName: Strings.getLang('ipc_statisics_page_oneWeek'),
    weekStartTime: getLastWeek(1)[0],
    weekEndTime: getLastWeek(1)[1],
  },
  {
    weekName: Strings.getLang('ipc_statisics_page_twoWeek'),
    weekStartTime: getLastWeek(2)[0],
    weekEndTime: getLastWeek(2)[1],
  },
  {
    weekName: Strings.getLang('ipc_statisics_page_threeWeek'),
    weekStartTime: getLastWeek(3)[0],
    weekEndTime: getLastWeek(3)[1],
  },
  {
    weekName: Strings.getLang('ipc_statisics_page_fourWeek'),
    weekStartTime: getLastWeek(4)[0],
    weekEndTime: getLastWeek(4)[1],
  },
  {
    weekName: Strings.getLang('ipc_statisics_page_fiveWeek'),
    weekStartTime: getLastWeek(5)[0],
    weekEndTime: getLastWeek(5)[1],
  },
  {
    weekName: Strings.getLang('ipc_statisics_page_sixWeek'),
    weekStartTime: getLastWeek(6)[0],
    weekEndTime: getLastWeek(6)[1],
  },
  {
    weekName: Strings.getLang('ipc_statisics_page_sevenWeek'),
    weekStartTime: getLastWeek(7)[0],
    weekEndTime: getLastWeek(7)[1],
  },
  {
    weekName: Strings.getLang('ipc_statisics_page_eightWeek'),
    weekStartTime: getLastWeek(8)[0],
    weekEndTime: getLastWeek(8)[1],
  },
  {
    weekName: Strings.getLang('ipc_statisics_page_nineWeek'),
    weekStartTime: getLastWeek(9)[0],
    weekEndTime: getLastWeek(9)[1],
  },
  {
    weekName: Strings.getLang('ipc_statisics_page_tenWeek'),
    weekStartTime: getLastWeek(10)[0],
    weekEndTime: getLastWeek(10)[1],
  },
];

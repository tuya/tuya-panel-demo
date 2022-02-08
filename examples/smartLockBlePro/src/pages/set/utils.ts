import _ from 'lodash';
import Strings from '@i18n';

export const hourFormat = (time: number) =>
  _.padStart(parseInt(`${time / 60}`, 10).toString(16), 2, '0');
export const minuteFormat = (time: number) =>
  _.padStart(parseInt(`${time % 60}`, 10).toString(16), 2, '0');

export const timeText = (muteModePeriod = '') => {
  if (muteModePeriod === '') return ' ';
  const endTime = {
    hour: parseInt(muteModePeriod.slice(4, 6), 16),
    minute: parseInt(muteModePeriod.slice(6, 8), 16),
  };
  const startTime = {
    hour: parseInt(muteModePeriod.slice(0, 2), 16),
    minute: parseInt(muteModePeriod.slice(2, 4), 16),
  };
  const showStart = `${_.padStart(startTime.hour.toString(), 2, '0')}:${_.padStart(
    startTime.minute.toString(),
    2,
    '0'
  )}`;
  const showEnd = `${_.padStart(endTime.hour.toString(), 2, '0')}:${_.padStart(
    endTime.minute.toString(),
    2,
    '0'
  )}`;
  const textTime =
    endTime.hour * 60 + endTime.minute <= startTime.hour * 60 + startTime.minute
      ? `${showStart}~${Strings.getLang('set_lastDay')}${showEnd}`
      : `${showStart}~${showEnd}`;
  return textTime;
};

import moment from 'moment';
import Strings from '../i18n';

export const checkIsToday = (date: any, enable = false) => {
  if (!enable) return date;
  const nowDay = moment(new Date()).format('YYYY-MM-DD');
  const res = nowDay === date ? Strings.getLang('today') : date;
  return res;
};

export const analysisDate = (data: any, enable = false) => {
  const getAmPm = date => {
    let dataItem = date.split(':');
    dataItem = dataItem.map((number: number) => Number(number));
    const hour = dataItem[0];
    let dateStr = '';
    if (5 >= hour && hour >= 1) {
      dateStr = Strings.getLang('beforeDawn');
    } else if (8 >= hour && hour > 5) {
      dateStr = Strings.getLang('dawn');
    } else if (11 >= hour && hour > 8) {
      dateStr = Strings.getLang('morning');
    } else if (13 >= hour && hour > 11) {
      dateStr = Strings.getLang('noon');
    } else if (17 >= hour && hour > 13) {
      dateStr = Strings.getLang('afternoon');
    } else if (19 >= hour && hour > 17) {
      dateStr = Strings.getLang('evening');
    } else if (20 >= hour && hour > 19) {
      dateStr = Strings.getLang('midNight');
    } else {
      dateStr = Strings.getLang('deepNight');
    }
    return {
      time: `${dateStr}  ${date}`,
    };
  };

  const dateDatas = data.map(item => {
    const time = !enable ? {} : getAmPm(item.time);
    return Object.assign({}, item, time);
  });
  return dateDatas;
};

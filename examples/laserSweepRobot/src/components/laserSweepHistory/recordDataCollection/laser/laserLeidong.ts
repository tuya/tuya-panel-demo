/** 雷动 清扫记录 */
import moment from 'moment';

import OSSRecordCollection from './ossRecordCollection';

export default class LaserLeiDongRecord extends OSSRecordCollection {
  parseOneRecord(item) {
    const { bucket, extend, file, id, time } = item;
    // const [date, startTime, endTime, cleanArea, cleanTime, mapLen, pathLen] = extend.split('_');
    const [
      recordId,
      date,
      startTime,
      cleanTime,
      cleanArea,
      mapLen,
      pathLen,
      virtualLen,
    ] = extend.split('_');
    const [time12, time12Unit] = moment(startTime, 'HHmmss').format('hh:mm-A').split('-');
    const time24 = moment(startTime, 'HHmmss').format('HH:mm');
    const dateTitle24 = moment(date + startTime, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm');
    const dateTitle = moment(date + startTime, 'YYYYMMDDHHmmss').format('YYYY-MM-DD hh:mm A');
    const [cleanAreaInt, cleanTimeInt, mapLenInt, pathLenInt, virtualLenInt] = [
      cleanArea,
      cleanTime,
      mapLen,
      pathLen,
      virtualLen,
    ].map(d => parseInt(d, 10));

    return {
      bucket,
      extend,
      file,
      id,
      date,
      time,
      startTime,
      cleanArea: cleanAreaInt,
      cleanTime: cleanTimeInt,
      time12,
      time12Unit,
      dateTitle,
      time24,
      dateTitle24,
      mapLen: mapLenInt,
      pathLen: pathLenInt,
      virtualLen: virtualLenInt,
    };
  }
}

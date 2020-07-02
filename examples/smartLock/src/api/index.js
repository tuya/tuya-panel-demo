import { TYSdk } from 'tuya-panel-kit';

const TYNative = TYSdk.native;
const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';

const api = function(a, postData, v = '1.0') {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest(
      {
        a,
        postData,
        v,
      },
      d => {
        const data = typeof d === 'string' ? JSON.parse(d) : d;
        console.log(`API Success: %c${a}%o`, sucStyle, data);
        resolve(data);
      },
      err => {
        const e = typeof err === 'string' ? JSON.parse(err) : err;
        console.log(`API Failed: %c${a}%o`, errStyle, e.message || e.errorMsg || e);
        reject(err);
      }
    );
  });
};

TYNative.getSaveDay = () => {
  return api('tuya.m.device.lock.active.period', {}, '1.0');
};

TYNative.getAlarmCount = () => {
  return api('tuya.m.device.lock.alarm.unread', {}, '1.0');
};

TYNative.getRecordLits = params => {
  return api('tuya.m.scale.history.list', params, '2.0');
};

//  报警记录合并
TYNative.getDpHistory = (dpIds, limit = 50, offset = 0) => {
  return api('tuya.m.device.lock.alarm.list', {
    limit,
    offset,
    dpIds,
  });
};

export default TYNative;

import { TYSdk, Utils } from 'tuya-panel-kit';

const TYNative = TYSdk.native;
const JSONUtils = Utils.JsonUtils;
const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';

// const api = (a, postData, v = '1.0') => {
//   return TYSdk.apiRequest({
//     a,
//     postData,
//     v,
//   })
//     .then(d => {
//       const data = typeof d === 'string' ? JSONUtils.parseJSON(d) : d;
//       console.log(`API Success: %c${a}%o`, sucStyle, data);
//       return data;
//     })
//     .catch(err => {
//       const e = typeof err === 'string' ? JSONUtils.parseJSON(err) : err;
//       console.log(`API Failed: %c${a}%o`, errStyle, e.message || e.errorMsg || e, postData);
//       return err;
//     });
// };

TYSdk.getDeviceCloudData = key => {
  return new Promise((resolve, reject) => {
    TYNative.getDevProperty(
      d => {
        if (typeof d !== 'undefined') {
          let data = d;
          if (key) {
            data = typeof d[key] !== 'undefined' ? d[key] : {};
          }
          if (typeof data === 'string') data = JSON.parse(data);
          resolve(data);
        } else reject();
      },
      err => reject(err)
    );
  });
};

TYSdk.saveDeviceCloudData = (key, data) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = typeof data === 'object' ? JSON.stringify(data) : data;
      TYNative.setDevProperty(key, jsonString, resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
};

export default TYSdk;

import { TYSdk } from 'tuya-panel-kit';

const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';

export const fetch = function (a: string, postData: any, v: string = '1.0') {
  console.log(`API Post: %c${a}%o`, sucStyle, postData);

  return new Promise((resolve, reject) => {
    TYSdk.native.apiRNRequest(
      {
        a,
        postData,
        v,
      },
      (d: any) => {
        const data = typeof d === 'string' ? JSON.parse(d) : d;
        console.log(`API Success: %c${a}%o`, sucStyle, data);
        resolve(data);
      },
      (err: any) => {
        const e = typeof err === 'string' ? JSON.parse(err) : err;
        console.log(`API Failed: %c${a}%o`, errStyle, e.message || e.errorMsg || e);
        reject(err);
      }
    );
  });
};

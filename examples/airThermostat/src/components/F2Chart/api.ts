/* eslint-disable import/prefer-default-export */
import { fetch } from 'api';
import { TYSdk } from 'tuya-panel-kit';

const getOssUrl = function() {
  // return fetch('tuya.m.app.panel.url.get', {});
  console.log(`API post: `, 'tuya.m.app.panel.url.get');

  return new Promise((resolve, reject) => {
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.app.panel.url.get',
        postData: {},
        v: '1.0',
      },
      (d: any) => {
        resolve(d);
      },
      (err: any) => {
        const e = typeof err === 'string' ? JSON.parse(err) : err;
        console.log(`API Failed: `, e.message || e.errorMsg || e);
        reject(err);
      }
    );
  });
  return TYSdk.native.apiRNRequest({ a: 'tuya.m.app.panel.url.get', postData: {}, v: '1.0' });
};

export { getOssUrl };

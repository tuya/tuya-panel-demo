import { TYSdk } from 'tuya-panel-kit';

const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';
export const TYDevice = TYSdk.device;
export const TYNative = TYSdk.native;
export const TYEvent = TYSdk.event;

interface PostData {
  devId: string;
  dpId: number;
  startDay: string;
  endDay: string;
  type: string;
}
export function getElecList(devId: string, dpCode: string, startTime: string, endTime: string) {
  return new Promise(() => {
    const postData: PostData = {
      devId,
      dpId: +TYDevice.getDpIdByCode(dpCode),
      startDay: startTime,
      endDay: endTime,
      type: 'max',
    };
    const a = 'tuya.m.dp.rang.stat.day.list';
    api(a, postData).catch(e => console.log(e));
  });
}

const api = (a: string, postData: PostData, v = '1.0') => {
  return new Promise((resolve, reject) => {
    TYSdk.apiRequest(
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

// 获取域名
export const getOssUrl = () => {
  return TYSdk.apiRequest<string>('tuya.m.app.panel.url.get', {}, '1.0');
};

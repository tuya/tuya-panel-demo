import { TYSdk, Utils } from 'tuya-panel-kit';
/**
 * 获取设备激活所在地的空气质量信息
 */
TYSdk.getWeatherQuality = () => {
  return new Promise((resolve, reject) => {
    TYSdk.device.getDeviceInfo().then(res => {
      const { devId } = res;
      TYSdk.apiRequest({
        a: 'tuya.m.public.weather.get',
        postData: {
          devId,
          codes: [
            'city.id',
            'city.name',
            'weather.air.qualityLevel',
            'weather.air.pm25',
            'weather.air.quality',
            'weather.now.temperature',
            'weather.now.hum',
            'weather.now.condIconUrl',
            'weather.now.condTxt',
          ],
        },
        v: '1.0',
      })
        .then(d => {
          const data = Utils.JsonUtils.parseJSON(d);
          console.log('data', data);
          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    });
  });
};

export default TYSdk;

/* eslint-disable import/no-unresolved */
import { to16, transform } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import dpCodes from '@config/dpCodes';
import defaultScenes from '@config/default/scenes';
import { IControlData, RgbSceneValue } from '@types';

const { rgbSceneCode } = dpCodes;

const rgbSceneFormater = {
  uuid: rgbSceneCode,
  parse(dpValue: string) {
    if (!dpValue) {
      console.warn(`无法解析数据【${rgbSceneCode}】: ${dpValue}`);
      return defaultScenes[1][0];
    }

    const generator = transform(dpValue);
    const step2 = () => {
      const { value } = generator.next(2);
      return value;
    };
    const step4 = () => {
      const { value } = generator.next(4);
      return value;
    };
    generator.next();
    const version = step2();
    const id = step2();
    const mode = step2();
    const interval = step2();
    const time = step2();
    const settingA = step2();
    const settingB = step2();
    const settingC = step2();
    const colors: IControlData[] = [];
    // eslint-disable-next-line no-constant-condition
    for (; true; ) {
      const value = step2();
      const hue = step4();
      const saturation = step2();
      const brightness = step4();
      const { value: temperature, done } = generator.next(4);
      colors.push({
        value,
        hue,
        saturation,
        brightness,
        temperature,
      });
      if (done) {
        break;
      }
    }
    return {
      version,
      id,
      mode,
      interval,
      time,
      settingA,
      settingB,
      settingC,
      colors,
    };
  },
  format(data: RgbSceneValue) {
    const { version, id, mode, interval, time, settingA, settingB, settingC, colors } = data;
    return `${to16(version)}${to16(id)}${to16(mode)}${to16(interval)}${to16(time)}${to16(
      settingA
    )}${to16(settingB)}${to16(settingC)}${colors
      .map(({ value, hue, saturation, brightness, temperature }) => {
        return `${to16(value)}${to16(hue, 4)}${to16(saturation)}${to16(brightness!, 4)}${to16(
          temperature!,
          4
        )}`;
      })
      .join('')}`;
  },
};
export default rgbSceneFormater;

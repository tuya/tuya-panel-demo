import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import { SceneValueType } from '@types';
import { nToHS, sToN, avgSplit, toN, formatterTransform, checkArray } from '@utils';
import DpCodes from '@config/dpCodes';

const {
  CoreUtils: { toFixed },
} = Utils;
const { sceneCode } = DpCodes;

export default class SmearFormater {
  uuid: string;

  defaultValue: any;

  constructor(uuid = sceneCode, defaultValue = {}) {
    this.uuid = uuid;
    this.defaultValue = defaultValue;
  }

  parse(val = ''): SceneValueType {
    // console.log('SmearFormater-parse', val);
    if (!val || typeof val !== 'string') {
      console.warn(sceneCode, 'dp数据有问题，无法解析', val);
      return this.defaultValue;
    }

    const generator = formatterTransform(val);
    const step = (n?: number) => generator.next(n);
    step();

    const version = toN(step(2).value);
    const id = toN(step(2).value);
    const mode = toN(step(2).value);
    const intervalTime = toN(step(2).value);
    const changeTime = toN(step(2).value);
    const speed = intervalTime;

    const result = {
      version,
      id,
      mode,
      speed,
    } as SceneValueType;

    if (mode === 20) {
      // 混合模式
      // FIXME: 用数组优化
      const optionA = toN(step(2).value);
      const optionB = toN(step(2).value);
      const optionC = toN(step(2).value);
      result.mixedIds = [optionA, optionB, optionC];
    } else {
      // 非混合模式
      const optionA = toN(step(2).value);
      const optionAStr = toFixed(optionA.toString(2), 8);

      const gn = formatterTransform(optionAStr);
      const st = (n?: number) => gn.next(n);
      st();

      result.segmented = sToN(st(1).value.toString(), 2);
      result.loop = sToN(st(1).value.toString(), 2);
      result.excessive = sToN(st(1).value.toString(), 2);
      result.direction = sToN(st(1).value.toString(), 2);
      result.expand = sToN(st(1).value.toString(), 2);
      result.reserved1 = sToN(st(1).value.toString(), 2);
      result.reserved2 = sToN(st(1).value.toString(), 2);
      const optionB = toN(step(2).value);
      const optionC = toN(step(2).value);
    }

    result.brightness = toN(step(2).value) * 10;
    result.colors = avgSplit(step().value.toString(), 6).map(v => ({
      hue: sToN(v.slice(0, 4)),
      saturation: sToN(v.slice(4)) * 10,
    }));

    return result;
  }

  format(data: SceneValueType): string {
    // console.log('SceneFormater-format', data);
    const {
      version = 1,
      id,
      mode = 0,
      speed = 50,
      mixedIds = [],
      segmented = 0,
      loop = 0,
      excessive = 0,
      direction = 0,
      expand = 0,
      reserved1 = 0,
      reserved2 = 0,
      brightness = 0,
      colors = [{ hue: 0, saturation: 0 }],
    } = data;
    const intervalTime = speed,
      changeTime = speed;

    let result = `${nToHS(version)}${nToHS(id)}${nToHS(mode)}${nToHS(intervalTime)}${nToHS(
      changeTime
    )}`;

    if (mode === 20) {
      // 混合模式
      result += mixedIds.map(v => `${nToHS(v)}`).join('');
    } else {
      // 非混合模式
      const optionA = nToHS(
        parseInt(
          `${segmented}${loop}${excessive}${direction}${toFixed(
            expand.toString(2),
            2
          )}${reserved1}${reserved2}`,
          2
        )
      );
      const optionB = nToHS(0);
      const optionC = nToHS(0);
      result += `${optionA}${optionB}${optionC}`;
    }

    const colorsString = colors
      .map(d => `${nToHS(d.hue, 4)}${nToHS(Math.round(d.saturation / 10))}`)
      .join('');
    result += `${nToHS(Math.round(brightness / 10))}${colorsString}`;

    return result;
  }
}
// # sourceMappingURL=ColourFormater.js.map

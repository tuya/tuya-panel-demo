/* eslint-disable import/no-unresolved */
import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import { DimmerMode, SmearMode, SmearDataType } from 'types';
import { nToHS, sToN, avgSplit, toN, formatterTransform } from '@utils';
import DpCodes from '@config/dpCodes';

const {
  CoreUtils: { toFixed },
} = Utils;
const { smearCode } = DpCodes;

export default class SmearFormater {
  uuid: string;

  defaultValue: SmearDataType;

  constructor(
    uuid = smearCode,
    defaultValue = {
      version: 0,
      dimmerMode: DimmerMode.colour,
      effect: 0,
      smearMode: SmearMode.all,
      hue: 0,
      saturation: 1000,
      value: 1000,
      brightness: 1000,
      temperature: 1000,
    }
  ) {
    this.uuid = uuid;
    this.defaultValue = defaultValue;
  }

  parse(val = ''): SmearDataType {
    if (!val || typeof val !== 'string') {
      console.warn(smearCode, 'dp数据有问题，无法解析', val);
      return this.defaultValue;
    }

    const generator = formatterTransform(val);
    const step = (n?: number) => generator.next(n);
    step();

    const version = toN(step(2).value);
    const dimmerMode = toN(step(2).value);

    const effect = toN(step(2).value);
    const ledNumber = toN(step(2).value);
    const result = {
      version,
      dimmerMode,
      effect,
      ledNumber,
    } as SmearDataType;

    if (dimmerMode === DimmerMode.white) {
      // 白光
      result.smearMode = toN(step(2).value);
      result.brightness = toN(step(4).value);
      result.temperature = toN(step(4).value);
    } else if ([DimmerMode.colour, DimmerMode.colourCard].includes(dimmerMode)) {
      // 彩光/色卡
      const smearMode = toN(step(2).value);
      result.smearMode = smearMode;
      result.hue = toN(step(4).value);
      result.saturation = toN(step(4).value);
      result.value = toN(step(4).value);
      if ([SmearMode.clear, SmearMode.single].includes(smearMode)) {
        const singleDataStr = toFixed(toN(step(2).value).toString(2), 8);

        const singleType = sToN(singleDataStr.slice(0, 1), 2);
        result.singleType = singleType;
        result.quantity = sToN(singleDataStr.slice(1), 2);

        const indexStr = step().value.toString();

        const indexs = new Set<number>();
        if (singleType === 0) {
          // 连续
          avgSplit(indexStr, 4).forEach(v => {
            const arr = avgSplit(v, 2);
            _.range(sToN(arr[0]), sToN(arr[1]) + 1).forEach(a => indexs.add(a - 1));
          });
        } else if (singleType === 1) {
          // 单点
          avgSplit(indexStr, 2).forEach(v => indexs.add(sToN(v) - 1));
        }
        result.indexs = indexs;
      }
    } else if (dimmerMode === DimmerMode.combination) {
      result.smearMode = SmearMode.all;
      // 颜色组合
      result.combineType = toN(step(2).value);
      result.combination = avgSplit(step().value.toString(), 12).map(v => {
        const [hue, saturation, value] = avgSplit(v, 4).map(c => sToN(c));
        return { hue, saturation, value };
      });
    }
    return result;
  }

  format(data: SmearDataType): string {
    const {
      version = 0,
      dimmerMode = DimmerMode.colour,
      effect = 0,
      ledNumber = 20,
      smearMode = SmearMode.all,
      hue = 0,
      saturation = 0,
      value = 0,
      brightness = 0,
      temperature = 0,
      combineType = 0,
      combination = [],
    } = data;

    // 白光不支持渐变
    let result = `${nToHS(version)}${nToHS(dimmerMode)}${nToHS(
      dimmerMode === DimmerMode.white ? 0 : effect
    )}${nToHS(ledNumber)}`;

    if (dimmerMode === DimmerMode.white) {
      // 白光
      result += `${nToHS(smearMode)}${nToHS(brightness, 4)}${nToHS(temperature, 4)}`;
    } else if ([DimmerMode.colour, DimmerMode.colourCard].includes(dimmerMode)) {
      // 彩光/色卡
      result += `${nToHS(smearMode)}${nToHS(hue, 4)}${nToHS(saturation, 4)}${nToHS(value, 4)}`;
      if ([SmearMode.single, SmearMode.clear].includes(smearMode)) {
        const { singleType = 1, indexs = new Set() /* quantity = indexs.size*/ } = data;
        // 数量

        const quantity = indexs.size; // 解决data中的quantity偶尔不更新的问题
        const singleDataStr = `${nToHS(
          parseInt(`${singleType}${toFixed(quantity.toString(2), 7)}`, 2)
        )}`;
        console.log('singleDataStr', singleDataStr);

        const indexsStr = `${[...indexs].reduce((acc, cur) => acc + nToHS(cur + 1), '')}`;
        result += `${singleDataStr}${indexsStr}`;
      }
    } else if (dimmerMode === DimmerMode.combination) {
      // 组合
      const colors = combination.map(
        item => `${nToHS(item.hue, 4)}${nToHS(item.saturation, 4)}${nToHS(item.value, 4)}`
      );
      result += `${nToHS(combineType)}${colors.join('')}`;
    }
    return result;
  }
}

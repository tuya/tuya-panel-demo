import NormalFormater from './NormalFormater';
import { SchemaType } from '../schema';

export default class NumberFormater extends NormalFormater {
  // 将标准协议数据转为项目数据
  parse(value: number): number {
    return this.formateValue(value);
  }
  formateValue(value: number): number {
    if (this.schema && this.schema.type === SchemaType.Number) {
      const { min, max } = this.schema;
      if (value < min) {
        return min;
      } else if (value > max) {
        return max;
      }
    }
    return value;
  }
  // 将数据转为标准协议数据
  format(value: number): number {
    return this.formateValue(value);
  }
}

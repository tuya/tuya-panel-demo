import NormalFormater from './NormalFormater';
import { SchemaType } from '../schema';

export default class StringFormater extends NormalFormater {
  // 将标准协议数据转为项目数据
  parse(value: string): string {
    return this.formateValue(value);
  }

  formateValue(value: string): string {
    if (this.schema && this.schema.type === SchemaType.Number) {
      const { maxlen = 255 } = this.schema;
      if (value && value.length > maxlen) {
        return value.substr(0, maxlen);
      }
    }
    return value;
  }

  // 将数据转为标准协议数据
  format(value: string): string {
    return this.formateValue(value);
  }
}

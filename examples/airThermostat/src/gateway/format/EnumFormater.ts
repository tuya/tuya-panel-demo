import NormalFormater from './NormalFormater';
import { SchemaType } from '../schema';

export default class EnumFormater extends NormalFormater {
  // 将标准协议数据转为项目数据
  parse(value: string): string {
    return this.formateValue(value);
  }

  formateValue(value: string): string {
    if (this.schema && this.schema.type === SchemaType.Number) {
      const { range = [] } = this.schema;
      if (range.indexOf(value) >= 0) {
        return value;
      }
      // todo 类型有误处理
    }
    return value;
  }

  // 将数据转为标准协议数据
  format(value: string): string {
    return this.formateValue(value);
  }
}

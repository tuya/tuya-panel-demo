import { SchemaType } from '.';
import { DpSchema } from '../interface';

export default class NormalSchema implements DpSchema {
  code: string;
  id: number;
  mode: 'rw' | 'wr';
  type: SchemaType = SchemaType.Unknow;
  constructor(data: DpSchema) {
    Object.assign(this, data);
  }
  validate(value: any): any {
    return true;
  }
  format(value: any): any {
    return value;
  }
}

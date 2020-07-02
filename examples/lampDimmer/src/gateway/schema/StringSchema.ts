import { SchemaType } from '.';
import { DpSchema } from '../interface';

export default class StringSchema implements DpSchema {
  code: string;
  id: number;
  maxlen: number;
  mode: 'rw' | 'wr';
  type: SchemaType = SchemaType.String;
  constructor(data: DpSchema) {
    Object.assign(this, data);
  }
  validate(value: string): boolean {
    return value.length <= this.maxlen;
  }
  format(value: string): string {
    if (value.length > this.maxlen) {
      return value.substr(0, this.maxlen);
    }
    return value;
  }
}

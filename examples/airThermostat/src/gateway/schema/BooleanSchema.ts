import { SchemaType } from '.';
import { DpSchema } from '../interface';

export default class BooleanSchema implements DpSchema {
  code: string;
  id: number;
  mode: 'rw' | 'wr';
  type: SchemaType = SchemaType.Boolean;
  constructor(data: DpSchema) {
    Object.assign(this, data);
  }
  validate(value: boolean): boolean {
    return typeof value === 'boolean';
  }
  format(value: boolean): boolean {
    return !!value;
  }
}

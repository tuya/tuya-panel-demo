import { SchemaType } from '.';
import { DpSchema } from '../interface';

export default class NumberSchema implements DpSchema {
  code: string;

  id: number;

  range: string[];

  mode: 'rw' | 'wr';

  type: SchemaType = SchemaType.Enum;

  constructor(data: DpSchema) {
    Object.assign(this, data);
  }

  validate(value: string): boolean {
    return this.range.indexOf(value) >= 0;
  }

  format(value: string): string {
    if (this.validate(value)) {
      return value;
    }
    return '';
  }
}

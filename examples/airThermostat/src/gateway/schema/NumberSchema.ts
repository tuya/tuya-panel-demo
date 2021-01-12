import { SchemaType } from '.';
import { DpSchema } from '../interface';

export default class NumberSchema implements DpSchema {
  code: string;

  id: number;

  max: number;

  min: number;

  mode: 'rw' | 'wr';

  scale: number;

  step: number;

  type: SchemaType = SchemaType.Number;

  constructor(data: DpSchema) {
    Object.assign(this, data);
  }

  validate(value: number): boolean {
    return value >= this.min && value <= this.max;
  }

  format(value: number): number {
    if (value < this.min) {
      return this.min;
    }
    if (value > this.max) {
      return this.max;
    }
    return value;
  }
}

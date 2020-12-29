import NormalFormater from './NormalFormater';
import EnumFormater from './EnumFormater';
import BooleanFormater from './BooleanFormater';
import NumberFormater from './NumberFormater';
import StringFormater from './StringFormater';
import { SchemaType, getSchema } from '../schema';
import { hasProp, getValue } from '../utils';
import { IFormater, Formaters, DpSchema } from '../interface';

const formaters: Formaters = {};

const FormaterClasses = {
  [SchemaType.Number]: NumberFormater,
  [SchemaType.String]: StringFormater,
  [SchemaType.Boolean]: BooleanFormater,
  [SchemaType.Enum]: EnumFormater,
};

export const register = (data: IFormater[]): void => {
  data.forEach(item => {
    const { uuid } = item;
    // eslint-disable-next-line no-param-reassign
    item.schema = getSchema(uuid);
    formaters[uuid] = item;
  });
};

export const getFormater = (uuid: string): IFormater | null => {
  if (hasProp(formaters, uuid)) {
    return formaters[uuid];
  }
  return null;
};

export const registerFormaterBySchema = (schema: DpSchema) => {
  const { code, type } = schema;
  let formater: IFormater;
  if (hasProp(FormaterClasses, type)) {
    const Clazz = getValue(FormaterClasses, type);
    formater = new Clazz(code);
  } else {
    formater = new NormalFormater(code);
  }
  formater.schema = schema;
  formaters[code] = formater;
};

export { NumberFormater, NormalFormater, StringFormater, BooleanFormater, EnumFormater };

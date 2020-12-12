import NumberSchema from './NumberSchema';
import StringSchema from './StringSchema';
import BooleanSchema from './BooleanSchema';
import BitmapSchema from './BitmapSchema';
import EnumSchema from './EnumSchema';
import RawSchema from './RawSchema';
import NormalSchema from './NormalSchema';
import { registerFormaterBySchema } from '../format/index';
import { hasProp } from '../utils';
import { DpSchema, DpSchemas } from '../interface';

const dpSchemas: DpSchemas = {};

export enum SchemaType {
  RAW = 'raw',
  Boolean = 'bool',
  String = 'string',
  Enum = 'enum',
  Number = 'value',
  BitMap = 'bitmap',
  Unknow = 'unknow',
}

const DpClasses = {
  [SchemaType.RAW]: RawSchema,
  [SchemaType.Boolean]: BooleanSchema,
  [SchemaType.String]: StringSchema,
  [SchemaType.Number]: NumberSchema,
  [SchemaType.BitMap]: BitmapSchema,
  [SchemaType.Enum]: EnumSchema,
  [SchemaType.Unknow]: NormalSchema,
};

const buildSchema = (type: SchemaType, data: DpSchema): DpSchema => {
  if (hasProp(DpClasses, type)) {
    return new DpClasses[type](data);
  }
  return new NormalSchema(data);
};

interface registerDpSchema {
  (data: DpSchemas): void;
}

/**
 * 注册dp的schema
 * 此方法会给dp点生成对应的formater, 所以注册dp schema后，再注册formater
 * @param data dp schema数据
 */
export const register: registerDpSchema = (data: DpSchemas) => {
  Object.keys(data).forEach(key => {
    const item = data[key];
    const { code, type } = item;
    const schema = buildSchema(type, item);
    dpSchemas[code] = schema;
    // create formater
    registerFormaterBySchema(item);
  });
};

export const isDpExist = (code: string) => {
  return hasProp(dpSchemas, code);
};

export const getSchema = (code: string): DpSchema => {
  if (isDpExist(code)) {
    return dpSchemas[code];
  }

  return null;
};

export {
  BitmapSchema,
  BooleanSchema,
  EnumSchema,
  NormalSchema,
  NumberSchema,
  StringSchema,
  RawSchema,
};

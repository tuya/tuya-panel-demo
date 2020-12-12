import { IFormater, DpSchema, SchemaDataType } from '../interface';

/**
 * 通用格式化器
 */
export default class NormalFormater implements IFormater {
  uuid: string;
  schema: DpSchema;
  constructor(uuid: string) {
    this.uuid = uuid;
  }

  // 比较两个值是否一致
  equal(source: SchemaDataType, target: SchemaDataType): boolean {
    return source === target;
  }
  // 将标准协议数据转为项目数据
  parse(value: SchemaDataType): SchemaDataType {
    return value;
  }
  // 将数据转为标准协议数据
  format(value: SchemaDataType): SchemaDataType {
    return value;
  }
}

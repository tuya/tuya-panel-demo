import NormalFormater from './NormalFormater';

export default class BooleanFormater extends NormalFormater {
  // 将标准协议数据转为项目数据
  parse(value: Boolean): Boolean {
    return !!value;
  }
  // 将数据转为标准协议数据
  format(value: Boolean): Boolean {
    return !!value;
  }
}

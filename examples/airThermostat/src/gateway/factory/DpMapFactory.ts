import { hasProp } from '../utils';
import _ from 'lodash';
import { DpMap, DpMapItem } from '../interface';

function* sliceValue(value: string): Generator<string, string, number> {
  let start = 0;
  let result: string = '';
  let length;
  for (; true; ) {
    length = yield result;
    result = value.substr(start, length);
    if (start + length >= value.length) {
      break;
    }
    start += length;
  }
  return result;
}

enum MapType {
  number = 'number',
  boolean = 'boolean',
  string = 'string',
  child = 'child',
  complex = 'complex',
}

export default {
  /**
   * 校验 dp 数据正确性
   * @param dpMap 映射关系
   * @param value dp 协议数据
   */
  validate(dpMap: DpMap, value: string): boolean {
    // 边界处理
    if (_.isEmpty(value)) {
      return false;
    }
    // 是否有多个映射
    if (Array.isArray(dpMap[0])) {
      return (dpMap as Array<Array<DpMapItem>>).some((item: DpMapItem[]) =>
        this._valiateData(item as DpMapItem[], value)
      );
    } else {
      return this._valiateData(dpMap, value);
    }
  },
  _valiateData(dpMap: DpMapItem[], value: string): boolean {
    // 边界处理
    if (_.isEmpty(value)) {
      return false;
    }
    const { sl: staticLength, dl: dynamicLength } = dpMap.reduce(
      ({ sl, dl }: any, item: DpMapItem) => {
        if (item.loop) {
          dl += item.length;
        } else {
          sl += item.length;
        }
        return { sl, dl };
      },
      { sl: 0, dl: 0 }
    );
    const { length } = value;
    // 是否有动态变化长度
    if (dynamicLength !== 0) {
      return (length - staticLength) % dynamicLength === 0;
    }

    return length === staticLength;
  },
  /**
   * 将协议数据转为可描述的对像数据
   * @param dpMap 映射关系
   * @param value dp 协议数据
   */
  parse(dpMap: DpMap, value: string) {
    if (Array.isArray(dpMap[0])) {
      const exist = (dpMap as Array<Array<DpMapItem>>).find((item: DpMapItem[]) =>
        this._valiateData(item as DpMapItem[], value)
      );
      if (exist) {
        return this._formatParseData(exist[0], this._parseData(exist, value));
      }
      return this._formatParseData(dpMap[0][0], this._returnDefault(dpMap[0]));
    } else {
      if (this._valiateData(dpMap, value)) {
        return this._formatParseData(dpMap[0], this._parseData(dpMap, value));
      }
      return this._formatParseData(dpMap[0], this._returnDefault(dpMap));
    }
  },
  /**
   * 处理解板的数据
   * 如果数据为列表数据，则忽略属性名，直接返回数组
   * @param firstMap 第一个映射规则
   * @param data 对象数据
   */
  _formatParseData(firstMap: DpMapItem, data: any) {
    // 如果第一个解析规则为多数据情况时，则直接返回数组，不返回对象（会忽略规则的属性名）
    if (firstMap.loop) {
      return data[firstMap.name];
    } else {
      return data;
    }
  },
  _parseData(dpMap: DpMapItem[], value: string) {
    // 是否存在有循环解板的配置
    const generator = sliceValue(value);
    generator.next();
    const result: any = {};
    dpMap.forEach((item: DpMapItem) => {
      const { name, length, type, decimal, loop, childMap, limit } = item;
      if (loop) {
        result[name] = [];
        let listLength = limit;
        if (limit !== undefined) {
          if (typeof limit === 'string') {
            listLength = result[limit];
          }
        }
        while (listLength >= 0 ? listLength > result[name].length : true) {
          const { value, done } = generator.next(length);
          result[name].push(this._parseItem(item, value, result[name]));
          if (done) {
            break;
          }
        }
      } else {
        const { value } = generator.next(length);
        // result[name] = this._parseItem(item, value);
        const res = this._parseItem(item, value, result);
        if (item.type === MapType.complex && typeof res === 'object') {
          Object.assign(result, res);
        } else {
          result[name] = res;
        }
      }
    });
    return result;
  },

  _parseItem(dpMap: DpMapItem, value: string, data: any) {
    const { childMap, type = 'number', decimal = 16, parse } = dpMap;

    // 如果自定义了解析方法，则使用自定义方法处理
    if (parse && typeof parse === 'function') {
      return parse(value, dpMap, data);
    }

    switch (type) {
      case MapType.child:
        return this._parseData(childMap, value);
      case MapType.string:
        return value;
      case MapType.boolean:
        return !!parseInt(value, decimal);
      case MapType.number:
      default:
        return parseInt(value, decimal);
    }
  },
  _returnDefault(dpMap: DpMapItem[]) {
    return dpMap.reduce((result: any, item: DpMapItem) => {
      const { name, loop, default: defaultValue } = item;
      if (loop) {
        if (typeof defaultValue !== 'undefined') {
          result[name] = defaultValue;
        } else {
          result[name] = [];
          result[name].push(this._returnItemDefault(item));
        }
      } else {
        const defaultValue = this._returnItemDefault(item);
        if (item.type === MapType.complex) {
          Object.assign(result, defaultValue);
        } else {
          result[name] = defaultValue;
        }
      }
      return result;
    }, {});
  },
  _returnItemDefault(dpMapItem: DpMapItem) {
    const { length, type, childMap, default: defaultValue } = dpMapItem;
    switch (type) {
      case MapType.child:
        return this._returnDefault(childMap);
      case MapType.complex:
        return typeof defaultValue === 'undefined' ? {} : defaultValue;
      case MapType.string:
        return typeof defaultValue === 'undefined' ? _.padStart('', length, '0') : defaultValue;
      case MapType.boolean:
        return typeof defaultValue === 'undefined' ? false : defaultValue;
      case MapType.number:
      default:
        return typeof defaultValue === 'undefined' ? 0 : defaultValue;
    }
  },
  /**
   * 将可描述对象数据转化为协议数据
   * @param dpMap 映射关系
   * @param data 可描述对象数据
   */
  format(dpMap: DpMap, data: any) {
    if (Array.isArray(dpMap[0])) {
      // 计算数据的匹配度，取最大匹配进行反解析
      const matchWeights = (dpMap as Array<Array<DpMapItem>>)
        .map((item: DpMapItem[], index: number) => {
          const weights = this._checkMapCanUse(item as DpMapItem[], data);
          return { index, weights };
        })
        .sort((a, b) => (a.weights > b.weights ? -1 : a.weights < b.weights ? 1 : 0));
      const matchIndex = matchWeights[0].index;

      const mapData: DpMapItem[] = dpMap[matchIndex] as DpMapItem[];
      data = this.initFormatData(mapData[0], data);
      return this._formatData(mapData, data);
    } else {
      data = this.initFormatData(dpMap[0], data);
      return this._formatData(dpMap, data);
    }
  },
  /**
   * 如果数据为列表数据，转化一下以转化为协议数据
   * @param firstMap 第一个映射规则
   * @param data 对象数据
   */
  initFormatData(firstMap: DpMapItem, data: any) {
    if (firstMap.loop && Array.isArray(data)) {
      return { [firstMap.name]: data };
    } else {
      return data;
    }
  },

  /**
   * 将映射关系转为类型的结构对象
   * 转换后的结构对象用于存在多个映射时寻找最大匹配的映射
   * @param dpMap 映射关系配置
   */
  getMapStructure(dpMap: DpMapItem[]) {
    const result: any = {};
    dpMap.forEach((item: DpMapItem) => {
      const { name, type, loop, childMap } = item;
      if (loop) {
        result[name] = [{}];
        result[name] = [this._getMapStructureItem(item)];
      }
      result[name] = this._getMapStructureItem(item, result);
    });
    if (dpMap.length === 1 && dpMap[0].loop) {
      return result[dpMap[0].name];
    }
    return result;
  },

  _getMapStructureItem(dpMap: DpMapItem) {
    const { childMap, name, length, type = 'number', decimal = 16 } = dpMap;
    switch (type) {
      case MapType.child:
        return this.getMapStructure(childMap);
      case MapType.string:
        return '';
      case MapType.boolean:
        return true;
      case MapType.number:
        return 0;
      default:
        return undefined;
    }
  },
  _checkMapCanUse(dpMap: DpMapItem[], data: any) {
    // 获取映射结构
    const structure = this.getMapStructure(dpMap);
    const keyCount = { total: 0, match: 0 };
    if (Array.isArray(data)) {
      if (typeof data[0] === 'object' && typeof structure[0] === 'object') {
        this._checkMapItemCanUse(structure[0], data[0], keyCount);
        return keyCount.match / (keyCount.total || 1);
      } else if (dpMap[0].loop) {
        return 1;
      } else {
        return 0;
      }
    }

    this._checkMapItemCanUse(structure, data, keyCount);
    return keyCount.match / (keyCount.total || 1);
  },
  _checkMapItemCanUse(structure: any, data: any, keyCount: { total: number; match: number }) {
    Object.keys(data).forEach((key: string) => {
      keyCount.total++;
      if (hasProp(structure, key)) {
        keyCount.match++;
        if (typeof data[key] === 'object') {
          if (Array.isArray(data[key])) {
            if (typeof data[key][0] === 'object' && typeof structure[key][0] === 'object') {
              return this._checkMapItemCanUse(structure[key][0], data[key][0], keyCount);
            }
          }
        } else {
          return this._checkMapItemCanUse(structure[key], data[key], keyCount);
        }
      }
    });
  },
  _formatData(dpMap: DpMapItem[], data: any) {
    return dpMap
      .map((item: DpMapItem) => {
        const { name, length, type, decimal, loop, childMap } = item;
        if (loop) {
          return data[name]
            .map((child: any) => {
              return this._formatItem(item, child, data[name]);
            })
            .join('');
        } else {
          return this._formatItem(item, data[name], data);
        }
      })
      .join('');
  },
  _formatItem(dpMap: DpMapItem, value: any, data: any) {
    const { childMap, name, length, type = 'number', decimal = 16, format } = dpMap;

    // 如果自定义了转化方法，则使用自定义方法处理
    if (format && typeof format === 'function') {
      return format(value, dpMap, data);
    }
    switch (type) {
      case MapType.child:
        return this._formatData(childMap, value);
      case MapType.string:
        return value;
      case MapType.boolean:
      case MapType.number:
      default:
        const result = Number(value).toString(decimal);
        return _.padStart(result, length, '0');
    }
  },
};

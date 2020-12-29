import { getFormater } from '../format/index';
import { getConfig } from '../configUtils';
import DpMapFactory from '../factory/DpMapFactory';
import { hasProp, getValue } from '../utils';
import { IDpQueue, IDpQueueData, IDpQueueDataItem, Config, DpData } from '../interface';

/**
 * 下发数据队列管理类
 * 此管理类会为每个下发的 dp 建立一个下发数据队列
 * 管理类可对上报数据进行校验数据有校性
 */
class DpQueueManager implements IDpQueue {
  data: IDpQueueData = {};

  getDpQueque(code: string): IDpQueueDataItem[] {
    if (hasProp(this.data, code)) {
      return getValue(this.data, code);
    }
    this.data[code] = [];
    return this.data[code];
  }

  /**
   * 记录下发数据
   * @param data 下发dp数据
   */
  add(data: DpData, config: Config) {
    const now = +new Date();
    const { excludeDp } = config;
    Object.keys(data).forEach(code => {
      // 过滤不需要记录的DP
      if (excludeDp.includes(code)) {
        return;
      }
      const queue = this.getDpQueque(code);
      queue.push({
        value: data[code],
        time: now,
        isReply: false,
      });
    });

    this.clearTimeOut();
  }

  /**
   * 清除过时dp
   * 每当有数据下发时，会进行一次清除
   */
  clearTimeOut() {
    const now = +new Date();
    const { timeOut } = getConfig();
    Object.keys(this.data).forEach(code => {
      const queue = this.getDpQueque(code);
      for (let i = queue.length - 1; i >= 0; i--) {
        const { time } = queue[i];
        if (now - time >= timeOut) {
          queue.splice(0, i + 1);
          break;
        }
      }
    });
  }

  /**
   * 根据下发数据队列过滤上发数据
   * @param data 上报的标准协议数据
   */
  filterDp(data: DpData) {
    const result: DpData = {};
    const now = +new Date();
    const { timeOut, dpMap = {} } = getConfig();
    Object.keys(data).forEach(code => {
      const queue = this.getDpQueque(code);
      const target = data[code];
      const hasMap = hasProp(dpMap, code);
      const formater = getFormater(code);

      for (let i = queue.length - 1; i >= 0; i--) {
        const { value, time, isReply } = queue[i];
        if (isReply) {
          // eslint-disable-next-line no-continue
          continue;
        }
        // 是否超时
        if (now - time >= timeOut) {
          queue.splice(0, i + 1);
          break;
        }
        const isEqual = value === target;
        if (isEqual) {
          queue[i].isReply = true;
          // 不是最后一个下发的值，则为无效上报数据
          if (i !== queue.length - 1) {
            return;
          }
          break;
        }
      }

      let dpValue = target;
      // 赋值并转换数据
      if (hasMap) {
        dpValue = DpMapFactory.parse(dpMap[code], dpValue);
      } else if (formater) {
        dpValue = formater.parse(dpValue);
      }
      result[code] = dpValue;
    });
    return result;
  }
}

export default new DpQueueManager();

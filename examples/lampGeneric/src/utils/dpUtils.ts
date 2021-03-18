const timeOut = 3000;
const dpPool = {};
const includeDpCodes = ['temp_value', 'bright_value', 'colour_data'];

interface TimePoolData {
  value: number | string | boolean | undefined;
  time: number;
}

export const recordDpQuery = (data: DpValueType) => {
  const now = +new Date();
  Object.keys(data).forEach((key: string) => {
    if (includeDpCodes.includes(key)) {
      if (typeof dpPool[key] === 'undefined') {
        dpPool[key] = [];
      }
      clearTimeOutData(dpPool[key]);
      dpPool[key].push({
        value: data[key],
        time: now,
      });
    }
  });
};

const clearTimeOutData = (data: TimePoolData[]) => {
  const now = +new Date();
  for (let i = data.length - 1; i >= 0; i--) {
    const { time } = data[i];
    if (now - time > timeOut) {
      data.splice(0, i + 1);
      break;
    }
  }
};

/**
 * 是否为过时下发数据对应的上报数据
 *
 * @param {string} workMode
 */
export const handleFilterData = (data: DpValueType) => {
  // 调节dp 不记录
  if (data.control_data) {
    return data;
  }

  const now = +new Date();
  // 过滤dp点
  const result = {};
  Object.keys(data).forEach((key: string) => {
    if (includeDpCodes.includes(key)) {
      const list = dpPool[key] || [];
      const target = data[key];
      for (let i = list.length - 1; i >= 0; i--) {
        const { value, time, isReply } = list[i];
        if (isReply) {
          // eslint-disable-next-line no-continue
          continue;
        }
        if (now - time > timeOut) {
          list.splice(0, i + 1);
          break;
        }
        if (
          target === value ||
          (typeof target === 'string' && target.toUpperCase() === value.toUpperCase())
        ) {
          // 不是最新数据，返回
          if (i === list.length - 1) {
            list[i].isReply = true;
            break;
          }
          return;
        }
      }
    }

    result[key] = data[key];
  });
  return result;
};

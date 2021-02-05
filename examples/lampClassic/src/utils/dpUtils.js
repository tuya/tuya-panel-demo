/* eslint-disable */
const timeOut = 3000;
const dpPool = {};

/**
 * 将下发数据放入数据栈中，以便上报时做过滤
 * @param { object } data 下发的数据
 */
export const recordDpQuery = data => {
  const now = +new Date();
  Object.keys(data).forEach(key => {
    if (typeof dpPool[key] === 'undefined') {
      dpPool[key] = [];
    }
    clearTimeOutData(dpPool[key]);
    dpPool[key].push({
      value: data[key],
      time: now,
    });
  });
};

const clearTimeOutData = data => {
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
export const handleFilterData = data => {
  // 调节dp 不记录
  if (data.control_data) {
    return data;
  }

  const now = +new Date();
  // 过滤dp点
  const result = {};
  Object.keys(data).forEach(key => {
    const list = dpPool[key] || [];
    const target = data[key];
    for (let i = list.length - 1; i >= 0; i--) {
      const { value, time, isReply } = list[i];
      if (isReply) {
        continue;
      }
      if (now - time > timeOut) {
        list.splice(0, i + 1);
        return;
      } else if (target === value) {
        // 不是最新数据，返回
        if (i === list.length - 1) {
          list[i].isReply = true;
          break;
        }
        return;
      }
    }

    result[key] = data[key];
  });
  return result;
};

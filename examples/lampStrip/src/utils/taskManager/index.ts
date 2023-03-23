import showTip from './showTip';

export { showTip };

export const TaskType = {
  RANDOM_TIMING: 'randomTiming', // 随机定时类型
  CYCLE_TIMING: 'cycleTiming', // 循环定时类型
  COUNTDOWN: 'countdown', // 倒计时类型
  SLEEP_TIMING: 'sleepTiming', // 入睡定时类型
  WAKEUP_TIMING: 'wakeupTimging', // 唤醒定时类型
  NORMAL_TIMING: 'normalTiming', // 普通定时类型
  RHYTHMS_TASK: 'rhythmsTask', // 生物节律类型
  OTHER: 'other', // 其他类型
  LOCAL_TIMING: 'localTiming', // 本地定时类型
};

/**
 * 当前有效任务队列
 * 数据格式:
 * {id: any, week: number, startTime: number, endTime: number, type: TaskType, originData: any}
 */
export const tasks: any[] = [];

const save = (data: any) => {
  tasks.push(data);
};

/**
 *  添加一个任务
 * @param {*} data 一般为:
 * type 为 COUNTDOWN 时, data 为 数字
 * type 为 RHYTHMS_TASK 时，data 为对象，必须有 weeks
 * 其他情况下为obj，必须要有以下属性: id, weeks, startTime, endTime
 * @param {TaskType} type
 * @param {'minute'|'second'} unit
 */
export const add = (data: any, type = TaskType.OTHER, unit = 'minute') => {
  let isStartInWeek = true;
  switch (type) {
    case TaskType.COUNTDOWN:
      save(formatCountdown(data, unit));
      break;
    case TaskType.RHYTHMS_TASK: {
      data.weeks.forEach((open: number, week: number) => {
        if (open) {
          save({
            id: 'rhythms',
            week,
            startTime: 0,
            endTime: 86400,
            type,
            originData: data,
          });
        }
      });
      break;
    }
    case TaskType.LOCAL_TIMING:
    case TaskType.NORMAL_TIMING: {
      isStartInWeek = false;
      const { id, weeks, startTime, endTime } = data;
      const startTimeBySecond = unit === 'minute' ? startTime * 60 : startTime;
      const endTimeBySecond = unit === 'minute' ? endTime * 60 : endTime;
      let hasNotWeek = true;
      weeks.forEach((open: number, week: number) => {
        if (open) {
          hasNotWeek = false;
          // 开始时间大于结束时间
          const result = getDataBySingleTime(id, week, startTimeBySecond, endTimeBySecond);
          result.forEach(item => {
            save({ ...item, type, originData: data });
          });
        }
      });
      if (hasNotWeek) {
        const result = formateNoSingleWeek(id, startTimeBySecond, endTimeBySecond);
        result.forEach(item => {
          save({ ...item, type, originData: data });
        });
      }
      break;
    }
    case TaskType.WAKEUP_TIMING:
      isStartInWeek = false;
    // eslint-disable-next-line no-fallthrough
    default: {
      const { id, weeks, startTime, endTime } = data;
      const startTimeBySecond = unit === 'minute' ? startTime * 60 : startTime;
      const endTimeBySecond = unit === 'minute' ? endTime * 60 : endTime;
      let hasNotWeek = true;
      weeks.forEach((open: number, week: number) => {
        if (open) {
          hasNotWeek = false;
          // 开始时间大于结束时间
          const result = getDataByTime(id, week, startTimeBySecond, endTimeBySecond, isStartInWeek);
          result.forEach(item => {
            save({ ...item, type, originData: data });
          });
        }
      });
      if (hasNotWeek) {
        const result = formateNoWeek(id, startTimeBySecond, endTimeBySecond, isStartInWeek);
        result.forEach(item => {
          save({ ...item, type, originData: data });
        });
      }
      break;
    }
  }
};

/**
 * 删除某一类定时数据
 * @param type
 * @param id // 如果传入，比较type 后，会再比较id，两者匹配才会删除数据
 */
export const remove = (...args: any[]) => {
  const [type, id] = args;
  for (let i = 0; i < tasks.length; i++) {
    const item = tasks[i];
    if (item.type === type) {
      if (typeof id !== 'undefined') {
        if (item.id === id) {
          tasks.splice(i--, 1);
        }
      } else {
        tasks.splice(i--, 1);
      }
    }
  }
};

// 处理云定时
export const removeAll = (type: string) => {
  for (let i = 0; i < tasks.length; i++) {
    const item = tasks[i];
    if (item.type === type) {
      tasks.splice(i--, 1);
    }
  }
};

/**
 * 检索当前是否存在该时间段的定时任务
 * @param {*} data
 */
const findExistTiming = (data: any) => {
  const { startTime, endTime, week, id, type } = data;
  return tasks.filter(item => {
    if (id !== item.id || type !== item.type) {
      if (item.week === week) {
        // 时间是否不存在交集
        if (
          (startTime < item.startTime && endTime < item.startTime) ||
          (item.startTime < startTime && item.endTime < startTime)
        ) {
          return false;
        }
        return true;
      }
    }
    return false;
  });
};

const findExistTimingSingleTime = (data: any) => {
  const { startTime, endTime, week, id, type } = data;
  return tasks.filter(item => {
    if (id !== item.id || type !== item.type) {
      if (item.week === week) {
        // 时间是否不存在交集
        if (startTime < item.startTime || startTime > item.endTime) {
          return false;
        }
        return true;
      }
    }
    return false;
  });
};

/**
 * 检查定时的段时是否已经存在其他定时
 * @param {*} data
 * @param {*} type
 * @param {*} unit
 */
export const check = (data: any, type = TaskType.OTHER, unit = 'minute') => {
  let exist: any[] = [];
  let isStartInWeek = true;
  switch (type) {
    case TaskType.COUNTDOWN: {
      const target = formatCountdown(data, unit);
      exist = findExistTiming(target);
      break;
    }
    case TaskType.RHYTHMS_TASK: {
      data.weeks.forEach((open: number, week: number) => {
        if (open) {
          const target = {
            id: 'rhythms',
            startTime: 0,
            endTime: 86400,
            week,
            type,
          };
          exist = exist.concat(findExistTiming(target));
        }
      });
      break;
    }
    case TaskType.LOCAL_TIMING:
    case TaskType.NORMAL_TIMING: {
      const { id, weeks, startTime, endTime } = data;
      const startTimeBySecond = unit === 'minute' ? startTime * 60 : startTime;
      const endTimeBySecond = unit === 'minute' ? endTime * 60 : endTime;
      // 是否选择了星期
      let isHasWeek = false;
      weeks.forEach((open: number, week: number) => {
        if (open) {
          isHasWeek = true;
          const result = getDataBySingleTime(id, week, startTimeBySecond, endTimeBySecond);
          result.forEach(item => {
            exist = exist.concat(findExistTimingSingleTime({ ...item, type }));
          });
        }
        return false;
      });
      if (!isHasWeek) {
        const result = formateNoSingleWeek(id, startTimeBySecond, endTimeBySecond);
        result.forEach(item => {
          exist = exist.concat(findExistTimingSingleTime({ ...item, type }));
        });
      }
      break;
    }
    case TaskType.WAKEUP_TIMING:
      isStartInWeek = false;
    // eslint-disable-next-line no-fallthrough
    default: {
      const { id, weeks, startTime, endTime } = data;
      const startTimeBySecond = unit === 'minute' ? startTime * 60 : startTime;
      const endTimeBySecond = unit === 'minute' ? endTime * 60 : endTime;
      // 是否选择了星期
      let isHasWeek = false;
      weeks.forEach((open: number, week: number) => {
        if (open) {
          isHasWeek = true;
          const result = getDataByTime(id, week, startTimeBySecond, endTimeBySecond, isStartInWeek);
          return result.forEach(item => {
            exist = exist.concat(findExistTiming({ ...item, type }));
          });
        }
        return false;
      });
      if (!isHasWeek) {
        const result = formateNoWeek(id, startTimeBySecond, endTimeBySecond, isStartInWeek);
        result.forEach(item => {
          exist = exist.concat(findExistTiming({ ...item, type }));
        });
      }
    }
  }

  // 去重
  if (exist.length) {
    const result: any = {};
    exist.forEach(item => {
      const { type: itemType, originData } = item;
      if (!result[itemType]) {
        result[itemType] = [];
      }
      if (result[itemType].indexOf(originData) === -1) {
        result[itemType].push(originData);
      }
    });
    return [true, result];
  }

  return [false, {}];
};

export const formatCountdown = (countdown: number, unit: string) => {
  if (unit === 'minute') {
    // eslint-disable-next-line no-param-reassign
    countdown *= 60;
  }
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const currentTime = hour * 3600 + minute * 60 + second;
  // 当天离明天还有多少时间
  const diffTime = 86400 - currentTime;
  let week = now.getDay();
  let startTime = currentTime + countdown;
  // 倒计时在明天才执行
  if (countdown > diffTime) {
    startTime = countdown - diffTime;
    if (week === 6) {
      week = 0;
    } else {
      week += 1;
    }
  }

  return {
    id: 'countdown',
    week,
    startTime,
    endTime: startTime,
    type: TaskType.COUNTDOWN,
    originData: countdown,
  };
};
const formateNoWeek = (id: number, startTime: number, endTime: number, isStartInWeek: boolean) => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const currentTime = hour * 3600 + minute * 60 + second;
  let week = now.getDay();
  if (currentTime > startTime) {
    week = week === 6 ? 0 : week + 1;
  }
  return getDataByTime(id, week, startTime, endTime, isStartInWeek);
};
const getDataByTime = (
  id: number,
  week: number,
  startTime: number,
  endTime: number,
  isStartInWeek: boolean
) => {
  const result: any[] = [];
  // 下一天
  if (startTime >= endTime) {
    // 开始时间在当天
    if (isStartInWeek) {
      const nextWeek = week !== 6 ? week + 1 : 0;
      result.push({
        id,
        week,
        startTime,
        endTime: 86400,
      });
      result.push({
        id,
        week: nextWeek,
        startTime: 0,
        endTime,
      });
    } else {
      const prevWeek = week !== 0 ? week - 1 : 6;
      result.push({
        id,
        week: prevWeek,
        startTime,
        endTime: 86400,
      });
      result.push({
        id,
        week,
        startTime: 0,
        endTime,
      });
    }
  } else if (endTime > 86400) {
    // 结束时间跨天
    const nextWeek = week !== 6 ? week + 1 : 0;
    result.push({
      id,
      week,
      startTime,
      endTime: 86400,
    });
    result.push({
      id,
      week: nextWeek,
      startTime: 0,
      endTime: endTime - 86400,
    });
  } else {
    result.push({
      id,
      week,
      startTime,
      endTime,
    });
  }
  return result;
};

const formateNoSingleWeek = (id: number, startTime: number, endTime: number) => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const currentTime = hour * 3600 + minute * 60 + second;
  let week = now.getDay();
  if (currentTime > startTime) {
    week = week === 6 ? 0 : week + 1;
  }
  return getDataBySingleTime(id, week, startTime, endTime);
};

const getDataBySingleTime = (id: number, week: number, startTime: number, endTime: number) => {
  const result: any = [];
  result.push({
    id,
    week,
    startTime,
    endTime,
  });
  return result;
};

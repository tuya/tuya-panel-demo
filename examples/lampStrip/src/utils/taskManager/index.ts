import showTip from './showTip';

export { showTip };

export const TaskType = {
  RANDOM_TIMING: 'randomTiming', // Random timing type
  CYCLE_TIMING: 'cycleTiming', // Loop timing type
  COUNTDOWN: 'countdown', // Countdown type
  SLEEP_TIMING: 'sleepTiming', // Sleep timing type
  WAKEUP_TIMING: 'wakeupTimging', // Wake up timing type
  NORMAL_TIMING: 'normalTiming', // Normal timing type
  RHYTHMS_TASK: 'rhythmsTask', // Biological rhythm type
  OTHER: 'other', // Other type
  LOCAL_TIMING: 'localTiming', // Local timing type
};

/**
 * Current valid task queue
 * Data format:
 * {id: any, week: number, startTime: number, endTime: number, type: TaskType, originData: any}
 */
export const tasks: any[] = [];

const save = (data: any) => {
  tasks.push(data);
};

/**
 *  Add a task
 * @param {*} data Generally:
 * type is COUNTDOWN, data is a number
 * type is RHYTHMS_TASK, data is an object, must have weeks
 * In other cases, it is an obj, must have the following attributes: id, weeks, startTime, endTime
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
          // Start time is greater than end time
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
          // Start time is greater than end time
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
 * Delete a certain type of timing data
 * @param type
 * @param id // If passed in, compare type, and then compare id, both match to delete data
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

// Handle cloud timing
export const removeAll = (type: string) => {
  for (let i = 0; i < tasks.length; i++) {
    const item = tasks[i];
    if (item.type === type) {
      tasks.splice(i--, 1);
    }
  }
};

/**
 * Check if there is a timing task for this time period
 * @param {*} data
 */
const findExistTiming = (data: any) => {
  const { startTime, endTime, week, id, type } = data;
  return tasks.filter(item => {
    if (id !== item.id || type !== item.type) {
      if (item.week === week) {
        // Whether the time does not exist intersection
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
        // Whether the time does not exist intersection
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
 * Check if the timing period already exists in other timings
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
      // Whether the week is selected
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
      // Whether the week is selected
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

  // Remove duplicates
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
  // Time left in the day until tomorrow
  const diffTime = 86400 - currentTime;
  let week = now.getDay();
  let startTime = currentTime + countdown;
  // Countdown will be executed tomorrow
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
  // Next day
  if (startTime >= endTime) {
    // Start time is in the current day
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
    // End time spans across days
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

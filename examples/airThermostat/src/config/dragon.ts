export default {
  // 开启节流
  openThrottle: true,
  // updateValidTime: 'syncs', // 同步更新 dp 数据
  /**
   * 下发数据时，检测当前值，若当前值已经是下发的数据，则过滤掉
   */
  checkCurrent: true,

  // 下发规则
  rules: [],
  // 场景转化插件
  formaters: [],
  // dp 转化规则
  dpMap: {},
};

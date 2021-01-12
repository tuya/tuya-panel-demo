import { Config } from './interface';

const config: Config = {
  /**
   * dp下发记录超时时间
   *
   */
  timeOut: 3000,
  /**
   * 上报有报比较方式
   * single: 单个 dp 下发与上报数据比较
   * double: 先比较all，若完全一致则再比较single
   */
  compareType: 'single',

  schema: {},

  formaters: [],

  isValidateLast: true,

  /**
   * 是否校验dp点的有效性
   */
  validateEnabled: true,

  /**
   * dp 点相关性校验
   * 如 只有在场景工作模式下，才能下发场景
   * 如 关灯情况下，下发dp时，自动开灯
   */
  rules: [],
  excludeDp: [],
  updateValidTime: 'reply',
  voiceOption: { default: 3 },
  openThrottle: false,
  throttleWaitTime: 300,
  checkCurrent: false,
};
export const setConfig = (options: Config) => {
  Object.assign(config, options);
};

export const getConfig = (): Config => {
  return config;
};

export const getPuDpData = () => {
  if (config.putDpData) {
    return config.putDpData;
  }
  return null;
};

export default { setConfig, getConfig, getPuDpData };

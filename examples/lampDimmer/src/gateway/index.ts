import { register as registerFormater } from './format/index';
import { register as registerSchema } from './schema/index';
import configUtils from './configUtils';
import * as gateway from './gateway/index';
import { DpData, SendOption, DpCallback, Config } from './interface';

/**
 * 下发 dp 点
 * @param data dp 数据
 * @param option 下发配置
 */
export const putDpData = async (data: DpData, option?: number | SendOption) => {
  // 兼容老方式处理
  let setting: SendOption = {};
  if (typeof option === 'number') {
    setting = {
      voice: option,
    };
  } else {
    setting = option || {};
  }
  // 使用worker发送
  return gateway.sendDp(data, setting);
};

/**
 * 接收上报 dp 数据
 * @param data dp 数据
 */
export const receiveDp = (data: DpData) => {
  gateway.receiveDp(data);
};

/**
 * 注册 dp 更新回调
 * @param callback dp 变更回调方法
 */
export const onDpChange = (callback: DpCallback) => {
  gateway.registerUpdateCallback(callback);
};

/**
 * 移除 dp 更新回调
 * @param callback 回调方法
 */
export const offDpChange = (callback: DpCallback) => {
  gateway.removeUpdateCallback(callback);
};

/**
 * 注册 dp 下发数据前回调
 * @param callback dp 处理回调方法
 */
export const onDpSendBefore = (callback: DpCallback) => {
  gateway.registerBeforeCallback(callback);
};

/**
 * 移除 dp 下发数据前回调
 * @param callback 回调方法
 */
export const offDpSendBefore = (callback: DpCallback) => {
  gateway.removeBeforeCallback(callback);
};

/**
 * 初始化 dp 数据
 * @param data
 */
export const initDp = (data: DpData) => {
  gateway.initDp(data);
};
/**
 * 注册配置信息
 * @param option 配置
 */
export const config = (option: Config) => {
  // 保存配置
  configUtils.setConfig(option);
  const { schema, formaters } = configUtils.getConfig();
  // 注册 schema
  registerSchema(schema);
  // 注册格式化器
  registerFormater(formaters);
};

export default {
  putDpData,
  receiveDp,
  config,
  onDpChange,
  offDpChange,
  onDpSendBefore,
  offDpSendBefore,
  initDp,
};

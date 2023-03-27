import { WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import DpCodes from '@config/dpCodes';
import SmearFormater from './SmearFormater';
import SceneFormater from './SceneFormater';
import MicMusicFormate from './MicMusicFormate';

const { powerCode, workModeCode, colourCode, controlCode, musicCode } = DpCodes;

const controlMap = [
  { name: 'mode', length: 1 },
  { name: 'hue', length: 4 },
  { name: 'saturation', length: 4 },
  { name: 'value', length: 4 },
  { name: 'brightness', length: 4 },
  { name: 'temperature', length: 4 },
];

export default {
  // 开启节流
  openThrottle: true,
  // updateValidTime: 'syncs', // 同步更新 dp 数据
  /**
   * 下发数据时，检测当前值，若当前值已经是下发的数据，则过滤掉
   */
  checkCurrent: true,
  throttleWaitTime: 333,
  // 下发规则
  rules: [
    {
      type: 'NEED',
      conditionType: 'OR',
      condition: [musicCode],
      effect: { [powerCode]: true },
    },
    {
      type: 'NEED',
      conditionType: 'AND',
      condition: [musicCode],
      effect: { [workModeCode]: WORK_MODE.MUSIC },
    },
  ],
  // 场景转化插件
  formaters: [new SmearFormater(), new SceneFormater(), new MicMusicFormate()],
  // dp 转化规则
  dpMap: {
    [colourCode]: [
      { name: 'hue', length: 4, default: 0 },
      { name: 'saturation', length: 4, default: 1000 },
      { name: 'value', length: 4, default: 1000 },
    ],
    [controlCode]: controlMap,
    [musicCode]: controlMap,
  },
};

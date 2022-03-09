import { WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
// eslint-disable-next-line import/no-unresolved
import rgbSceneFormater from '@config/dragons/rgbSceneFormater';
import { ColourFormatter, ControlDataFormatter } from '@tuya/tuya-panel-lamp-sdk/lib/formatter';
import dpCodes from './dpCodes';
import SmearFormater from './dragons/SmearFormater';

const {
  powerCode,
  workModeCode,
  sceneCode,
  brightCode,
  temperatureCode,
  colourCode,
  musicCode,
  rgbMusicCode,
  rgbSceneCode,
  controlCode,
} = dpCodes;

const numMap = (name: string, length = 2, defaultValue = 0) => {
  return { name, length, default: defaultValue };
};

const powerMap = {
  name: 'power',
  type: 'boolean',
  length: 2,
  default: false,
};

export default {
  // 开启节流
  openThrottle: true,
  // updateValidTime: 'syncs', // 同步更新 dp 数据
  /**
   * 下发数据时，检测当前值，若当前值已经是下发的数据，则过滤掉
   */
  checkCurrent: true,

  // 下发规则
  rules: [
    {
      type: 'NEED',
      conditionType: 'OR',
      condition: [rgbSceneCode, brightCode, temperatureCode, colourCode],
      effect: { [powerCode]: true },
    },
    {
      type: 'NEED',
      conditionType: 'OR',
      condition: [brightCode, temperatureCode],
      effect: { [workModeCode]: WORK_MODE.WHITE },
    },
    {
      type: 'NEED',
      conditionType: 'AND',
      condition: [colourCode],
      effect: { [workModeCode]: WORK_MODE.COLOUR },
    },
    {
      type: 'NEED',
      conditionType: 'AND',
      condition: [sceneCode],
      effect: { [workModeCode]: WORK_MODE.SCENE },
    },
  ],
  // 场景转化插件
  formaters: [
    rgbSceneFormater,
    new SmearFormater(),
    new ColourFormatter(),
    new ControlDataFormatter(controlCode),
    new ControlDataFormatter(musicCode),
  ],
  // dp 转化规则
  dpMap: {
    [rgbMusicCode]: [
      numMap('version', 2, 1),
      powerMap,
      numMap('id'),
      numMap('mode'),
      numMap('speed'),
      numMap('sensitivity'),
      numMap('settingA'),
      numMap('settingB'),
      numMap('settingC'),
    ],
  },
};

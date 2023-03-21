import { WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import DpCodes from '@config/dpCodes';
import SmearFormater from './SmearFormater';
import SceneFormater from './SceneFormater';
import MicMusicFormate from './MicMusicFormate';

// setTimeout(() => {
//   console.log(
//     '--------ssscene',
//     new SceneFormater().parse(
//       '01 CA 02 5D 5D E0 00 00  4D 00 B4 5E 01 1C 64 00 E8 49 00 C6 5F '.trim().split(' ').join('')
//     )
//   );
// }, 1500);

const {
  powerCode,
  workModeCode,
  smearCode,
  sceneCode,
  brightCode,
  temperatureCode,
  colourCode,
  countdownCode,
  controlCode,
  musicCode,
  micMusicCode,
} = DpCodes;

const numMap = (name: string, length = 2, defaultValue = 0) => {
  return { name, length, default: defaultValue };
};

const versionMap = numMap('version');
const powerMap = {
  name: 'power',
  type: 'boolean',
  length: 2,
  default: false,
};

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
  formaters: [
    new SmearFormater(),
    new SceneFormater(),
    new MicMusicFormate(),
    // {
    //   uuid: countdownCode,
    //   parse(value: number) {
    //     return Math.floor(value / 60);
    //   },
    //   format(value: number) {
    //     return value * 60;
    //   },
    // },
  ],
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

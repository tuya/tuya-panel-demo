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
  // Enable throttle
  openThrottle: true,
  // updateValidTime: 'syncs', // Synchronize update dp data
  /**
   * When sending data, check the current value. If the current value is already the sent data, filter it out.
   */
  checkCurrent: true,
  throttleWaitTime: 333,
  // Issuing rules
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
  // Scene conversion plugin
  formaters: [new SmearFormater(), new SceneFormater(), new MicMusicFormate()],
  // dp conversion rules
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

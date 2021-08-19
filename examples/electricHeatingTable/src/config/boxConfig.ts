import { BoxConfigs, Images, ImgType } from './interface';
import imgs from '../res';
import { Utils } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

const allmoreFunction = [
  'countdown_set',
  'countdown_left',
  'child_lock',
  'quiet',
  'power_consumption',
  'time_calibration',
];
const allheating = [
  'left_front_warm',
  'right_front_warm',
  'left_back_warm',
  'right_back_warm',
  'front_warm',
  'back_warm',
  'left_warm',
  'right_warm',
  'all_warm',
  'add',
  'minus',
  'status',
];
const alldesktopHeight = ['up_down'];
const allcooking = ['cook_mode', 'switch_cooking', 'stove_temp'];
const allkeepWarm = ['temp_set', 'heating'];
const boxConfigs: BoxConfigs = {
  allmoreFunction,
  allheating,
  alldesktopHeight,
  allcooking,
  allkeepWarm,
};
const images: Images = {
  countdown_set: 'countdown',
  child_lock: 'childLock',
  quiet: 'quiet',
  power_consumption: 'power',
  time_calibration: 'time',
  timing: 'timing',
};
const dpCodes: { [key: string]: string } = {
  countdown: 'countdown_set',
  childLock: 'child_lock',
  quiet: 'quiet',
  power: 'power_consumption',
  time: 'time_calibration',
  timing: 'timing',
};
const defaultThemeColor = '#3F84C9';
const defaultBackground = require('../res').imgs.texture1;

const standardDp = [
  'switch',
  'switch_cooking',
  'heating',
  'cook_mode',
  'left_front_warm',
  'right_front_warm',
  'left_back_warm',
  'right_back_warm',
  'front_warm',
  'back_warm',
  'left_warm',
  'right_warm',
  'all_warm',
  'power_consumption',
  'temp_set',
  'temp_current',
  'capacity_current',
  'child_lock',
  'status',
  'stove_temp',
  'add',
  'minus',
  'up_down',
  'countdown_set',
  'countdown_left',
  'time_calibration',
  'voice_heating',
  'voice_warm',
  'fault',
  'quiet',
];
const dpActiveColor = 'rgba(255,255,255,0.4)';
const dpInActiveColor = 'rgba(255,255,255,0.2)';
export {
  images,
  dpCodes,
  defaultThemeColor,
  standardDp,
  dpActiveColor,
  dpInActiveColor,
  defaultBackground,
};
const directionCircleStyle = {
  width: cx(46),
  height: cx(46),
  position: 'absolute',
};
const eightDircetion = [
  {
    name: 'front_warm',
    img: imgs.directionCircle,
    rotate: 0,
    imgWH: directionCircleStyle,
    style: { left: cx(74.5) },
    textStyle: { marginTop: cx(10) },
  },
  {
    name: 'right_front_warm',
    img: imgs.directionCircle,
    rotate: 45,
    imgWH: directionCircleStyle,
    style: { left: cx(127), top: cx(22) },
    textStyle: { marginTop: cx(16), marginRight: cx(10) },
  },
  {
    name: 'right_warm',
    img: imgs.directionCircle,
    rotate: 90,
    imgWH: directionCircleStyle,
    style: { left: cx(149), top: cx(75) },
    textStyle: { marginTop: cx(17) },
  },
  {
    name: 'right_back_warm',
    img: imgs.directionCircle,
    rotate: 135,
    imgWH: directionCircleStyle,
    style: { left: cx(127), top: cx(127) },
    textStyle: { marginBottom: cx(-18), marginLeft: cx(2) },
  },
  {
    name: 'back_warm',
    img: imgs.directionCircle,
    rotate: 180,
    imgWH: directionCircleStyle,
    style: { left: cx(75), top: cx(149) },
    textStyle: { marginTop: cx(10) },
  },
  {
    name: 'left_back_warm',
    img: imgs.directionCircle,
    rotate: -135,
    imgWH: directionCircleStyle,
    style: { left: cx(22), top: cx(127) },
    textStyle: { marginTop: cx(17) },
  },
  {
    name: 'left_warm',
    img: imgs.directionCircle,
    rotate: -90,
    imgWH: directionCircleStyle,
    style: { left: cx(0), top: cx(75) },
    textStyle: { marginTop: cx(17) },
  },
  {
    name: 'left_front_warm',
    img: imgs.directionCircle,
    rotate: -45,
    imgWH: directionCircleStyle,
    style: { left: cx(22), top: cx(22) },
    textStyle: { marginTop: cx(15), marginLeft: cx(6) },
  },
];

export const getHeatingDirection = (heatingArray: string[]) => {
  const heating = heatingArray
    .map((item: string) => {
      if (item.indexOf('_warm') !== -1 && item !== 'all_warm') {
        return item;
      }
    })
    .filter((item: string) => item);
  const isFrontForward2 =
    ['front_warm', 'back_warm'].filter(item => heating.indexOf(item) > -1).length === 2;
  const isLeftForward2 =
    ['left_warm', 'right_warm'].filter(item => heating.indexOf(item) > -1).length === 2;
  const isforward4 =
    ['front_warm', 'back_warm', 'left_warm', 'right_warm'].filter(
      item => heating.indexOf(item) > -1
    ).length === 4;
  const isIncline4 =
    ['left_front_warm', 'right_front_warm', 'left_back_warm', 'right_back_warm'].filter(
      item => heating.indexOf(item) > -1
    ).length === 4;
  const isFrontForward3 =
    ['front_warm', 'left_warm', 'right_warm'].filter(item => heating.indexOf(item) > -1).length ===
    3;
  const isBackForward3 =
    ['back_warm', 'left_warm', 'right_warm'].filter(item => heating.indexOf(item) > -1).length ===
    3;
  const heatingLength = heating.length;

  let imgType: ImgType[];
  if (heatingLength === 2 && isFrontForward2) {
    imgType = [
      {
        name: 'front_warm',
        img: imgs.directionForWard,
        rotate: 0,
        imgWH: { width: cx(195), height: cx(95) },
        style: { marginBottom: cx(5) },
        textStyle: { marginTop: cx(-28) },
      },
      {
        name: 'back_warm',
        img: imgs.directionForWard,
        rotate: 180,
        imgWH: { width: cx(195), height: cx(95) },
        textStyle: { marginTop: cx(-28) },
      },
    ];
  } else if (heatingLength === 2 && isLeftForward2) {
    imgType = [
      {
        name: 'left_warm',
        img: imgs.directionForWard,
        rotate: 90,
        imgWH: { width: cx(195), height: cx(95) },
        style: {
          position: 'absolute',
          right: cx(-50),
          top: cx(50),
          marginBottom: cx(5),
        },
        textStyle: { marginTop: cx(-16) },
      },
      {
        name: 'right_warm',
        img: imgs.directionForWard,
        rotate: -90,
        imgWH: { width: cx(195), height: cx(95) },
        style: {
          position: 'absolute',
          left: cx(-50),
          top: cx(50),
          marginBottom: cx(5),
        },
        textStyle: { marginTop: cx(-16) },
      },
    ];
  } else if (heatingLength === 3 && isFrontForward3) {
    imgType = [
      {
        name: 'front_warm',
        img: imgs.directionForWard2,
        rotate: 0,
        imgWH: { width: cx(195), height: cx(65) },
        style: { marginBottom: cx(8) },
      },
      {
        name: 'left_warm',
        img: imgs.directionForWard5,
        rotate: 180,
        imgWH: { width: cx(93.5), height: cx(122) },
        style: { marginRight: cx(8) },
        textStyle: { marginTop: cx(-6) },
      },
      {
        name: 'right_warm',
        img: imgs.directionForWard4,
        rotate: 180,
        imgWH: { width: cx(93.5), height: cx(122) },
        textStyle: { marginTop: cx(-6) },
      },
    ];
  } else if (heatingLength === 3 && isBackForward3) {
    imgType = [
      {
        name: 'left_warm',
        img: imgs.directionForWard4,
        rotate: 0,
        imgWH: { width: cx(93.5), height: cx(120) },
        style: { marginRight: cx(8) },
        textStyle: { marginTop: cx(-6) },
      },
      {
        name: 'right_warm',
        img: imgs.directionForWard5,
        rotate: 0,
        imgWH: { width: cx(93.5), height: cx(120) },
        textStyle: { marginTop: cx(-6) },
      },
      {
        name: 'back_warm',
        img: imgs.directionForWard2,
        rotate: 180,
        imgWH: { width: cx(195), height: cx(65) },
        style: { marginTop: cx(8) },
      },
    ];
  } else if (heatingLength === 4 && isforward4) {
    imgType = [
      {
        name: 'front_warm',
        img: imgs.directionForWard2,
        rotate: 0,
        imgWH: { width: cx(195), height: cx(60) },
        style: { marginRight: cx(5), marginBottom: cx(5), position: 'absolute' },
      },
      {
        name: 'right_warm',
        img: imgs.directionForWard3,
        rotate: 0,
        imgWH: { width: cx(67), height: cx(65) },
        style: {
          marginBottom: cx(5),
          right: 0,
          top: cx(65),
          position: 'absolute',
        },
        textStyle: { marginRight: cx(7) },
      },
      {
        name: 'back_warm',
        img: imgs.directionForWard2,
        rotate: 180,
        imgWH: { width: cx(195), height: cx(60) },
        style: { marginRight: cx(5), bottom: 0, position: 'absolute' },
      },
      {
        name: 'left_warm',
        img: imgs.directionForWard3,
        rotate: 180,
        imgWH: { width: cx(67), height: cx(65) },
        style: { left: 0, top: cx(65), position: 'absolute' },
        textStyle: { marginRight: cx(7) },
      },
    ];
  } else if (heatingLength === 4 && isIncline4) {
    imgType = [
      {
        name: 'left_front_warm',
        img: imgs.directionIncline1,
        rotate: 0,
        imgWH: { width: cx(95), height: cx(95) },
        style: { marginRight: cx(5), marginBottom: cx(5) },
      },
      {
        name: 'right_front_warm',
        img: imgs.directionIncline1,
        rotate: 90,
        imgWH: { width: cx(95), height: cx(95) },
        style: { marginBottom: cx(5) },
      },
      {
        name: 'left_back_warm',
        img: imgs.directionIncline1,
        rotate: 270,
        imgWH: { width: cx(95), height: cx(95) },
        style: { marginRight: cx(5) },
      },
      {
        name: 'right_back_warm',
        img: imgs.directionIncline1,
        rotate: 180,
        imgWH: { width: cx(95), height: cx(95) },
      },
    ];
  } else if (heatingLength === 8) {
    imgType = eightDircetion;
  } else {
    imgType = eightDircetion.filter((item: ImgType) => heating.indexOf(item.name) > -1);
  }
  return imgType;
};

export default boxConfigs;

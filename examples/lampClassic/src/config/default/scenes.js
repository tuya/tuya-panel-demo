/* eslint-disable max-len */
import Strings from '../../i18n';
import resource from '../../res';

const nightName = Strings.getLang('scene_night');
const readingName = Strings.getLang('scene_reading');
const partyName = Strings.getLang('scene_party');
const leisureName = Strings.getLang('scene_leisure');
const softName = Strings.getLang('scene_soft');
const rainbowName = Strings.getLang('scene_rainbow');
const shineName = Strings.getLang('scene_shine');
const gorgeousName = Strings.getLang('scene_gorgeous');

// 1路灯场景
const type1Scenes = [
  {
    sceneId: 0,
    isDefault: true,
    pic: resource.night,
    name: nightName,
    value: '000e0d0000000000000000c803e8',
  },
  {
    sceneId: 1,
    isDefault: true,
    pic: resource.reading,
    name: readingName,
    value: '010e0d0000000000000003e803e8',
  },
  {
    sceneId: 2,
    isDefault: true,
    pic: resource.party,
    name: partyName,
    value: '020e0d0000000000000003e803e8',
  },
  {
    sceneId: 3,
    isDefault: true,
    pic: resource.leisure,
    name: leisureName,
    value: '030e0d0000000000000001f403e8',
  },
];

// 2路灯场景
const type2Scenes = [
  {
    sceneId: 0,
    isDefault: true,
    pic: resource.night,
    name: nightName,
    value: '000e0d0000000000000000c80000',
  },
  {
    sceneId: 1,
    isDefault: true,
    pic: resource.reading,
    name: readingName,
    value: '010e0d0000000000000003e801f4',
  },
  {
    sceneId: 2,
    isDefault: true,
    pic: resource.party,
    name: partyName,
    value: '020e0d0000000000000003e803e8',
  },
  {
    sceneId: 3,
    isDefault: true,
    pic: resource.leisure,
    name: leisureName,
    value: '030e0d0000000000000001f401f4',
  },
];

// 3路场景参数 - 默认为静态
const type3Scenes = [
  {
    // id: 0,
    sceneId: 0,
    isDefault: true,
    pic: resource.night,
    name: nightName,
    value: '000e0d00002e03e802cc00000000',
  },
  {
    // id: 1,
    sceneId: 1,
    isDefault: true,
    pic: resource.reading,
    name: readingName,
    value: '010e0d000084000003e800000000',
  },
  {
    // id: 2,
    sceneId: 2,
    isDefault: true,
    pic: resource.party,
    name: partyName,
    value: '020e0d00001403e803e800000000',
  },
  {
    // id: 3,
    sceneId: 3,
    isDefault: true,
    pic: resource.leisure,
    name: leisureName,
    value: '030e0d0000e80383031c00000000',
  },
  {
    // id: 4,
    sceneId: 4,
    isDefault: true,
    pic: resource.soft,
    name: softName,
    value: '04464602007803e803e800000000464602007803e8000a00000000',
  },
  {
    // id: 5,
    sceneId: 5,
    isDefault: true,
    pic: resource.rainbow,
    name: rainbowName,
    value:
      '05464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000',
  },
  {
    id: 6,
    sceneId: 6,
    isDefault: true,
    pic: resource.shine,
    name: shineName,
    value: '06464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000',
  },
  {
    id: 7,
    sceneId: 7,
    isDefault: true,
    pic: resource.gorgeous,
    name: gorgeousName,
    value:
      '07464602000003e803e800000000464602007803e803e80000000046460200f003e803e800000000464602003d03e803e80000000046460200ae03e803e800000000464602011303e803e800000000',
  },
];

// 四路灯
const type4Scenes = [
  ...type1Scenes,
  {
    // id: 4,
    sceneId: 4,
    isDefault: true,
    pic: resource.soft,
    name: softName,
    value: '04464602007803e803e800000000464602007803e8000a00000000',
  },
  {
    // id: 5,
    sceneId: 5,
    isDefault: true,
    pic: resource.rainbow,
    name: rainbowName,
    value:
      '05464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000',
  },
  {
    id: 6,
    sceneId: 6,
    isDefault: true,
    pic: resource.shine,
    name: shineName,
    value: '06464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000',
  },
  {
    id: 7,
    sceneId: 7,
    isDefault: true,
    pic: resource.gorgeous,
    name: gorgeousName,
    value:
      '07464602000003e803e800000000464602007803e803e80000000046460200f003e803e800000000464602003d03e803e80000000046460200ae03e803e800000000464602011303e803e800000000',
  },
];

// 五路灯
const type5Scenes = [
  ...type2Scenes,
  {
    // id: 4,
    sceneId: 4,
    isDefault: true,
    pic: resource.soft,
    name: softName,
    value: '04464602007803e803e800000000464602007803e8000a00000000',
  },
  {
    sceneId: 5,
    isDefault: true,
    pic: resource.rainbow,
    name: rainbowName,
    value:
      '05464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000',
  },
  {
    sceneId: 6,
    isDefault: true,
    pic: resource.shine,
    name: shineName,
    value: '06464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000',
  },
  {
    sceneId: 7,
    isDefault: true,
    pic: resource.gorgeous,
    name: gorgeousName,
    value:
      '07464602000003e803e800000000464602007803e803e80000000046460200f003e803e800000000464602003d03e803e80000000046460200ae03e803e800000000464602011303e803e800000000',
  },
];

export const fetchSceneDefaultValue = dpFun => {
  const {
    isSupportColor,
    isSupportWhite,
    isSupportWhiteTemp,
    isSupportWhiteBright,
    isSupportScene,
  } = dpFun;

  // 默认情景值
  let scenes = [];
  if (isSupportScene) {
    if (isSupportColor) {
      if (isSupportWhiteTemp) {
        // 5路
        scenes = type5Scenes;
      } else if (isSupportWhiteBright) {
        // 4路
        scenes = type4Scenes;
      } else {
        // 3路
        scenes = type3Scenes;
      }
    } else if (isSupportWhite) {
      if (isSupportWhiteTemp) {
        // 2路
        scenes = type2Scenes;
      } else {
        // 1路
        scenes = type1Scenes;
      }
    }
  }

  return scenes;
};

export { type3Scenes, type2Scenes, type1Scenes, type4Scenes, type5Scenes };

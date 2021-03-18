/* eslint-disable max-len */
import Strings from '../i18n';
// const MAX_LEN_VALUE = '000e0d00002e03e802cc000000000e0d0000a101f3024a000000000e0d0000cf012d0034000000000e0d0000b000a10131000000000e0d00011000070230000000000e0d0000c8022f01e7000000000e0d0000c500d00117000000000e0d0000050237030e00000000';

// 分开放是因为devProperty接口要存储长度1024限制
// 前四个一路白光场景参数 - 默认为静态
export const defaultBrightScenes = [
  {
    name: Strings.getDpLang('scene_data_0'),
    value: '000e0d0000000000000000c803e8',
  },
  {
    name: Strings.getDpLang('scene_data_1'),
    value: '010e0d0000000000000003e803e8',
  },
  {
    name: Strings.getDpLang('scene_data_2'),
    value: '020e0d0000000000000003e803e8',
  },
  {
    name: Strings.getDpLang('scene_data_3'),
    value: '030e0d0000000000000001f403e8',
  },
];

// 前四个二路白光场景参数 - 默认为静态
export const defaultWhiteScenes = [
  {
    name: Strings.getDpLang('scene_data_0'),
    value: '000e0d0000000000000000c80000',
  },
  {
    name: Strings.getDpLang('scene_data_1'),
    value: '010e0d0000000000000003e801f4',
  },
  {
    name: Strings.getDpLang('scene_data_2'),
    value: '020e0d0000000000000003e803e8',
  },
  {
    name: Strings.getDpLang('scene_data_3'),
    value: '030e0d0000000000000001f401f4',
  },
];

// 前四个彩光场景参数 - 默认为静态
export const defaultColourScenes = [
  {
    name: Strings.getDpLang('scene_data_0'),
    value: '000e0d00002e03e802cc00000000',
  },
  {
    name: Strings.getDpLang('scene_data_1'),
    value: '010e0d000084000003e800000000',
  },
  {
    name: Strings.getDpLang('scene_data_2'),
    value: '020e0d00001403e803e800000000',
  },
  {
    name: Strings.getDpLang('scene_data_3'),
    value: '030e0d0000e80383031c00000000',
  },
];

// 后四个场景参数 - 默认为动态（只在有彩光的时候使用）
export const defaultDynamicScenes = [
  {
    name: Strings.getDpLang('scene_data_4'),
    value: '04464602007803e803e800000000464602007803e8000a00000000',
  },
  {
    name: Strings.getDpLang('scene_data_5'),
    value:
      '05464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000',
  },
  {
    name: Strings.getDpLang('scene_data_6'),
    value: '06464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000',
  },
  {
    name: Strings.getDpLang('scene_data_7'),
    value:
      '07464602000003e803e800000000464602007803e803e80000000046460200f003e803e800000000464602003d03e803e80000000046460200ae03e803e800000000464602011303e803e800000000',
  },
];

// 自定义场景参数 - 默认为空（只在只有白光的时候使用）
export const defaultCustomScenes = [];

export default {
  cloudState: {
    staticScenes: defaultColourScenes,
    dynamicScenes: defaultDynamicScenes,
    customScenes: defaultCustomScenes,
    sceneDatas: [...defaultColourScenes, ...defaultDynamicScenes],
  },
};

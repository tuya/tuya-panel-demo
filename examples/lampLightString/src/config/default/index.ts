/* eslint-disable import/no-unresolved */
import Strings from '@i18n';
import Res from '@res';
import { DimmerMode, SmearMode, IColour } from '../../types';

export { default as defaultLocalMusic } from './localMusic';

export const ControlTabs = {
  power: 'power',
  dimmer: 'dimmer',
  scene: 'scene',
  music: 'music',
  schedule: 'schedule',
};
export const dynamices = [
  // 闪耀
  {
    name: 'shine',
    value: 4,
    label: Strings.getLang('dynamic_shine'),
    icon: Res.shine,
    stops: { '100%': '#F7CB47', '0%': '#FCE77D' },
  },
  // 闪烁
  {
    name: 'flashing',
    value: 2,
    label: Strings.getLang('dynamic_flashing'),
    icon: Res.flashing,
    stops: { '100%': '#57CDB2', '0%': '#90E8D9' },
  },
  {
    name: 'breath',
    value: 3,
    label: Strings.getLang('dynamic_breath'),
    icon: Res.breath,
    stops: { '100%': '#EA3C9A', '0%': '#F66FCA' },
  },
];
export const defaultColors: IColour[] = [
  {
    hue: 0,
    saturation: 1000,
    value: 1000,
  },
  {
    hue: 30,
    saturation: 1000,
    value: 1000,
  },
  {
    hue: 60,
    saturation: 1000,
    value: 1000,
  },
  {
    hue: 120,
    saturation: 1000,
    value: 1000,
  },
  {
    hue: 180,
    saturation: 1000,
    value: 1000,
  },
  {
    hue: 240,
    saturation: 1000,
    value: 1000,
  },
  {
    hue: 300,
    saturation: 1000,
    value: 1000,
  },
];

export const colourPickerConfigBgs = [
  {
    colors: [
      { offset: '0%', stopColor: '#FF0000', stopOpacity: 1 },
      { offset: '12%', stopColor: '#FEAD19', stopOpacity: 1 },
      { offset: '24%', stopColor: '#F1F80E', stopOpacity: 1 },
      { offset: '36%', stopColor: '#08FB2B', stopOpacity: 1 },
      { offset: '48%', stopColor: '#04FAFC', stopOpacity: 1 },
      { offset: '60%', stopColor: '#0243FC', stopOpacity: 1 },
      { offset: '72%', stopColor: '#8700F9', stopOpacity: 1 },
      { offset: '84%', stopColor: '#FC00EF', stopOpacity: 1 },
      { offset: '96%', stopColor: '#F00A5B', stopOpacity: 1 },
      { offset: '100%', stopColor: '#FF0000', stopOpacity: 1 },
    ],
  },
  {
    x2: '0%',
    y2: '100%',
    colors: [
      { offset: '0%', stopColor: '#fff', stopOpacity: 1 },
      { offset: '16%', stopColor: '#fff', stopOpacity: 0.9 },
      { offset: '100%', stopColor: '#fff', stopOpacity: 0 },
    ],
  },
];
/** dimmerMode对应的smearMode */
export const dimmerModeSmeaModeMaps = {
  [DimmerMode.white]: [SmearMode.all],
  [DimmerMode.colour]: [SmearMode.all, SmearMode.single, SmearMode.clear],
  [DimmerMode.colourCard]: [SmearMode.all, SmearMode.single, SmearMode.clear],
  [DimmerMode.combination]: [SmearMode.all],
};

import { WorkMode, HomeTab, DimmerMode, SmearMode } from '@types';

export { default as defaultLocalMusic } from './localMusic';

/** dimmerMode对应的smearMode */
export const dimmerModeSmeaModeMaps = {
  [DimmerMode.white]: [SmearMode.all],
  [DimmerMode.colour]: [SmearMode.all, SmearMode.single, SmearMode.clear],
  [DimmerMode.colourCard]: [SmearMode.all, SmearMode.single, SmearMode.clear],
  [DimmerMode.combination]: [SmearMode.all],
};

/** workMode对应的homeTab */
export const workModeMappingHomeTab = {
  [WorkMode.white]: HomeTab.dimmer,
  [WorkMode.colour]: HomeTab.dimmer,
  [WorkMode.scene]: HomeTab.scene,
  [WorkMode.music]: HomeTab.music,
};

export const defaultColors: ColourData[] = [
  { hue: 0, saturation: 1000, value: 1000 },
  { hue: 30, saturation: 1000, value: 1000 },
  { hue: 60, saturation: 1000, value: 1000 },
  { hue: 120, saturation: 1000, value: 1000 },
  { hue: 180, saturation: 1000, value: 1000 },
  { hue: 240, saturation: 1000, value: 1000 },
  { hue: 300, saturation: 1000, value: 1000 },
];

import Strings from '@i18n';

const defaultSceneData = {
  speed: 50,
  segmented: 0,
  loop: 0,
  excessive: 0,
  direction: 0,
  expand: 0,
  reserved1: 0,
  reserved2: 0,
  brightness: 1000,
  colors: [
    { hue: 0, saturation: 1000 },
    { hue: 100, saturation: 600 },
  ],
};

const modes = [1, 2, 3, 4, 10, 11, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16];

/** Modes with adjustable segments */
export const SegmentableModes = [1, 2, 3, 4, 6, 7, 12];

/** Modes with adjustable direction */
export const DirectionAbleModes = [10, 11, 5, 6, 7, 8, 9];

export default modes.map(mode => ({
  key: String(mode),
  title: Strings.getLang(`scene_mode_${mode}`),
  value: {
    ...defaultSceneData,
    mode,
  },
}));

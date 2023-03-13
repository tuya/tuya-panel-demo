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
// 一期6个 1渐变 2跳变 3呼吸 4闪烁 10流水 11彩虹
// 二期10个 5流星 6堆积 7飘落 8追光 9飘动 12闪现 13反弹 14穿梭 15乱闪 16开合
const modes = [1, 2, 3, 4, 10, 11, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16];

/** 可调分段的变化方式 */
export const SegmentableModes = [1, 2, 3, 4, 6, 7, 12];

/** 可调方向的变化方式 */
export const DirectionAbleModes = [10, 11, 5, 6, 7, 8, 9];

export default modes.map(mode => ({
  key: String(mode),
  title: Strings.getLang(`scene_mode_${mode}`),
  value: {
    ...defaultSceneData,
    mode,
  },
}));

import { Utils } from 'tuya-panel-kit';
import { GradientDir, UIDataPropType } from './interface';

const { convertX: cx } = Utils.RatioUtils;

export const gradientDirMap = {
  [GradientDir.right]: { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
  [GradientDir.left]: { x1: '100%', y1: '0%', x2: '0%', y2: '0%' },
  [GradientDir.up]: { x1: '0%', y1: '100%', x2: '0%', y2: '0%' },
  [GradientDir.down]: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
};

export const UIDataRectangle: UIDataPropType[] = [
  {
    width: cx(52),
    height: cx(18),
    pos: [0, 0],
    gradientDir: GradientDir.right,
    imgKey: 'e1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(54), 0],
    gradientDir: GradientDir.right,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(108), 0],
    gradientDir: GradientDir.right,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(162), 0],
    gradientDir: GradientDir.right,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(216), 0],
    gradientDir: GradientDir.right,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(70),
    pos: [cx(270), 0],
    gradientDir: GradientDir.down,
    imgKey: 'u1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(216), cx(52)],
    gradientDir: GradientDir.left,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(162), cx(52)],
    gradientDir: GradientDir.left,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(108), cx(52)],
    gradientDir: GradientDir.left,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(54), cx(52)],
    gradientDir: GradientDir.left,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(70),
    pos: [cx(0), cx(52)],
    gradientDir: GradientDir.down,
    imgKey: 'u2',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(54), cx(104)],
    gradientDir: GradientDir.right,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(108), cx(104)],
    gradientDir: GradientDir.right,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(162), cx(104)],
    gradientDir: GradientDir.right,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(216), cx(104)],
    gradientDir: GradientDir.right,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(70),
    pos: [cx(270), cx(104)],
    gradientDir: GradientDir.down,
    imgKey: 'u1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(216), cx(156)],
    gradientDir: GradientDir.left,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(162), cx(156)],
    gradientDir: GradientDir.left,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(108), cx(156)],
    gradientDir: GradientDir.left,
    imgKey: 'l1',
  },
  {
    width: cx(52),
    height: cx(18),
    pos: [cx(54), cx(156)],
    gradientDir: GradientDir.left,
    imgKey: 'l1',
  },
];

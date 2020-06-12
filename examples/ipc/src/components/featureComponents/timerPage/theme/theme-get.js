/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
import { Utils } from 'tuya-panel-kit';
import baseTheme from './base';

const { getTheme } = Utils.ThemeUtils;

/**
 * Timer Variants
 */
const d1 = baseTheme.timer;

export const timer = {
  fontColor: props => getTheme(props, 'timer.fontColor', d1.fontColor),
  titleBg: props => getTheme(props, 'timer.titleBg', d1.titleBg),
  titleFontColor: props => getTheme(props, 'timer.titleFontColor', d1.titleFontColor),
  boardBg: props => getTheme(props, 'timer.boardBg', d1.boardBg),
  cellBg: props => getTheme(props, 'timer.cellBg', d1.cellBg),
  cellLine: props => getTheme(props, 'timer.cellLine', d1.cellLine),
  subFontColor: props => getTheme(props, 'timer.subFontColor', d1.subFontColor),
  btnBg: props => getTheme(props, 'timer.btnBg', d1.btnBg),
  btnBorder: props => getTheme(props, 'timer.btnBorder', d1.btnBorder),
  btnFontColor: props => getTheme(props, 'timer.btnFontColor', d1.btnFontColor),
  repeatColor: props => getTheme(props, 'timer.repeatColor', d1.repeatColor),
  thumbTintColor: props => getTheme(props, 'timer.thumbTintColor', d1.thumbTintColor),
  onThumbTintColor: props => getTheme(props, 'timer.onThumbTintColor', d1.onThumbTintColor),
  onTintColor: props => getTheme(props, 'timer.onTintColor', d1.onTintColor),
  tintColor: props => getTheme(props, 'timer.tintColor', d1.tintColor),
  ios_backgroundColor: props =>
    getTheme(props, 'timer.ios_backgroundColor', d1.ios_backgroundColor),
  statusBgStyle: props => getTheme(props, 'timer.statusBgStyle', d1.statusBgStyle),
};

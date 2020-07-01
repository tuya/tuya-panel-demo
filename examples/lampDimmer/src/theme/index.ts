import color from 'color';
import controllbar from './controllbar';

const C1 = '#fff';
const C2 = '#F5A623';
const C3 = '#505A6B';
export default {
  // type: 'default',
  global: {
    background: {
      x1: '0%',
      x2: '0%',
      y1: '0%',
      y2: '100%',
      '0%': '#252931',
      '100%': '#252931',
    },
  },
  standard: {
    fontColor: C1,
    iconBgColor: color(C1)
      .alpha(0.15)
      .rgbString(),
    tabBgColor: color(C1)
      .alpha(0.04)
      .rgbString(),
    subFontColor: color(C1)
      .alpha(0.4)
      .rgbString(),
    themeColor: C2,
    boxActiveBgColor: color(C1)
      .alpha(0.04)
      .rgbString(),
    boxBgColor: color(C1)
      .alpha(0.008)
      .rgbString(),
    buttonBarBgColor: color(C3)
      .alpha(0.08)
      .rgbString(),
    sliderMaxColor: color(C1)
      .alpha(0.1)
      .rgbString(),
  },
  button: { fontColor: '#fff' },
  topbar: {
    color: '#fff',
    background: 'transparent',
  },
  controllbar,
  dialog: {
    // bg: '#1A1A1A',
    // titleFontColor: '#fff',
    // subTitleFontColor: '#ccc',
    // cancelFontColor: '#fff',
    confirmFontColor: '#FF4800',
    // lineColor: '#404040',
    // prompt: {
    //   bg: '#262626'
    // }
  },
  popup: {
    confirmFontColor: '#FF4800',
  },
};

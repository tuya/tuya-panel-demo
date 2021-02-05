import color from 'color';

const fontColor = '#fff';
const themeColor = '#4397D7';

export default {
  global: {
    fontColor,
    brand: themeColor,
    background: {
      '0%': '#391D62',
      '100%': '#12062C',
      x1: '0',
      y1: '0',
      x2: '100%',
      y2: '0',
    },
    text: {
      dark: color(fontColor).alpha(0.5).rgbString(),
      light: color(fontColor).alpha(0.5).rgbString(),
    },
  },
  topbar: {
    color: '#fff',
    background: 'transparent',
  },
  slider: {
    minimumTrackTintColor: fontColor,
    maximumTrackTintColor: color(fontColor).alpha(0.2).rgbString(),
    thumbTintColor: fontColor,
  },
  fontColor: color(fontColor).alpha(0.5).rgbString(),
  iconBackColor: color(fontColor).alpha(0.2).rgbString(),
  activeFontColor: fontColor,
  iconBgColor: color(fontColor).alpha(0.15).rgbString(),
  tabBgColor: color(fontColor).alpha(0.04).rgbString(),
  sceneBgColor: color(fontColor).alpha(0.1).rgbString(),
  btnBgColor: color(fontColor).alpha(0.72).rgbString(),
};

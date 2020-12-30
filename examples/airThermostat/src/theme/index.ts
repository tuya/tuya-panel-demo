import color from 'color';

const fontColor = '#000';
const themeColor = '#1ABB9C';
const background = '#f7f7f7';
export default {
  global: {
    brand: themeColor,
    fontColor,
    iconBgColor: color(fontColor).alpha(0.15).rgbString(),
    tabBgColor: color(fontColor).alpha(0.04).rgbString(),
    iconColor: '#3D3D3D',
    background,
    text: {
      light: fontColor,
      dark: fontColor,
    },
  },
  // button: { fontColor: '#fff' },
  topbar: {
    color: fontColor,
    background: 'transparent',
  },
  switchButton: {
    onTintColor: themeColor,
  },

  controllbar: {
    iconColor: '#b2b2b2',
    fontSize: 14,
  },
};

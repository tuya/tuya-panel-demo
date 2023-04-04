/* eslint-disable @typescript-eslint/ban-ts-comment */
import color from 'color';

// Theme  configurations
export default () => {
  const isDarkTheme = true;
  const type = isDarkTheme ? 'dark' : 'light';
  const themeColor = '#39a9ff';
  const fontColor = isDarkTheme ? '#fff' : '#000';
  // @ts-ignore
  const subFontColor = color(fontColor).alpha(0.4).rgbaString();
  const background = isDarkTheme ? '#0B0909' : '#EBF0FF';
  const boxBgColor = isDarkTheme ? '#222222' : '#fff';
  const dividerColor = isDarkTheme ? 'rgba(255,255,255,0.1)' : '#E3E7F5';
  return {
    type,
    isDarkTheme,
    background,
    themeColor,
    fontColor,
    dividerColor,
    subFontColor,
    boxBgColor,
    subPageBgColor: isDarkTheme ? '#232222' : '#EBF0FF',
    subPageBoxBgColor: isDarkTheme ? 'rgba(255,255,255,0.07)' : '#fff',
    global: {
      isDarkTheme,
      brand: themeColor, // Theme color
      themeColor, // Theme color
      background,
      fontSizeBase: 0.875, // 14/16
      fontColor,
      dividerColor,
      subFontColor,
      iconColor: isDarkTheme ? '#fff' : '#acacac',
      text: {
        light: fontColor,
        dark: fontColor,
      },
    },
    slider: {
      light: {
        // minimumTrackTintColor: themeColor, // Minimum color
        // maximumTrackTintColor: '#e5e5e5', // Maximum color
      },
      dark: {
        // minimumTrackTintColor: themeColor,
        // maximumTrackTintColor: 'rgba(255, 255, 255, 0.3)',
      },
    },
    brickButton: {
      bgColor: themeColor,
    },
    picker: {
      light: {
        dividerColor: '#CBCEDA',
      },
      dark: {
        dividerColor: '#3C3C3D',
      },
    },
    switchButton: {
      onTintColor: themeColor,
    },
    popup: {
      type,
      light: {
        cellBg: '#fff',
        lineColor: '#E5E5E5',
      },
      dark: {
        cellBg: '#1A1A1A',
        lineColor: '#313131',
      },
    },
    dialog: {
      confirmFontColor: themeColor,
    },
  };
};

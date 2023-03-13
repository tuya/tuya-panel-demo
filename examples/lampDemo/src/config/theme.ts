/* eslint-disable prettier/prettier */
import { GlobalTheme, Utils } from 'tuya-panel-kit';
import { getUIValue } from '@tuya-rn/tuya-native-standard-hoc/lib/withUIConfig/utils';
import color from 'color';
import { DeepPartial } from '@utils';

const { convertX: cx } = Utils.RatioUtils;

export default (config: any) => {
  const isDarkTheme = config.theme === 'default';
  const type = isDarkTheme ? 'dark' : 'light';
  const themeColor = getUIValue(config, 'themeColor');
  const fontColor = isDarkTheme ? '#fff' : '#000';
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
      brand: themeColor, // 品牌色（主题色）
      themeColor, // 主题色
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
        // minimumTrackTintColor: themeColor, // 最小值颜色
        // maximumTrackTintColor: '#e5e5e5', // 最大值颜色
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
  } as DeepPartial<GlobalTheme>;
};

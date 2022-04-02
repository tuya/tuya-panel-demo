/* eslint-disable indent */
/**
 * 深色主题
 */
export default () => {
  // const isDefault = config.theme === 'default';
  const isDefault = true;
  const fontColor = '#fff';
  const themeColor = '#39a9ff';
  const defaultBg = isDefault
    ? {
        '0%': '#000',
        '100%': '#000',
      }
    : {
        '0%': '#F7F7F7',
        '100%': '#F3F3F3',
      };

  const background = '#1b2331' || defaultBg;
  return {
    type: 'dark',
    global: {
      background: '#1b2331',
      isDefaultTheme: isDefault,
      brand: themeColor,
      themeColor,
      fontColor,
      text: {
        light: fontColor,
        dark: fontColor,
      },
    },
    button: { fontColor: '#fff' },
    topbar: {
      color: () => (isDefault ? '#fff' : '#000'),
      background: 'transparent',
    },
    switchButton: {
      onTintColor: themeColor, // 开启情况下背景色
    },
    popup: {
      type: 'dark',
      checkboxColor: themeColor,
    },
    dialog: {
      bg: '#FFF',
      titleFontColor: '#333',
      subTitleFontColor: '#999',
      cancelFontColor: '#999',
      confirmFontColor: themeColor,
      lineColor: '#E5E5E5',
      prompt: {
        bg: '#fff',
      },
    },
    picker: {
      dividerColor: 'rgba(130,132,134,0.4)',
    },
  };
};

export default {
  default: {
    theme: 'default',
    global: {
      fontColor: '#fff',
      themeColor: '#4397D7',
    },
    background: {
      rangeType: 'blank',
      type: 'color',
      value: {
        initialize: {
          0: '#391D62',
          100: '#12062C',
          deg: 90,
        },
      },
    },
  },

  light: {
    theme: 'light',
    global: {
      fontColor: '#000',
    },
    background: {
      rangeType: 'blank',
      type: 'color',
      value: {
        initialize: {
          0: '#E2EDE6',
          100: '#B2D7D2',
          deg: 90,
        },
      },
    },
  },
};

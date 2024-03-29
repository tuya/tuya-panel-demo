const path = require('path');

module.exports = {
  root: true,
  extends: ['tuya/react-native'],
  rules: {
    'one-var': 0,
    '@typescript-eslint/no-unused-vars': 0,
    'react/jsx-props-no-spreading': 0,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@api', path.resolve(__dirname, './src/api')],
          ['@components', path.resolve(__dirname, './src/components')],
          ['@config', path.resolve(__dirname, './src/config')],
          ['@i18n', path.resolve(__dirname, './src/i18n')],
          ['@store', path.resolve(__dirname, './src/store')],
          ['@res', path.resolve(__dirname, './src/res')],
          ['@utils', path.resolve(__dirname, './src/utils')],
          ['@protocol', path.resolve(__dirname, './src/protocol')],
          ['@pages', path.resolve(__dirname, './src/pages')],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  },
};

const path = require('path');

module.exports = {
  root: true,
  extends: ['tuya/react-native'],
  rules: {
    'one-var': 0,
    '@typescript-eslint/no-unused-vars': 0,
    'react/jsx-props-no-spreading': 0,
    'react/destructuring-assignment': 0,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@api', path.resolve(__dirname, './src/api')],
          ['@components', path.resolve(__dirname, './src/components')],
          ['@config', path.resolve(__dirname, './src/config')],
          ['@i18n', path.resolve(__dirname, './src/i18n')],
          ['@models', path.resolve(__dirname, './src/models')],
          ['@res', path.resolve(__dirname, './src/res')],
          ['@utils', path.resolve(__dirname, './src/utils')],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  },
};

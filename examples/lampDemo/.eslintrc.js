const path = require('path');

module.exports = {
  root: true,
  extends: ['tuya/react-native'],
  rules: {
    'one-var': 0,
    'react/require-default-props': 0,
    'react/no-unused-prop-types': 0,
    'react/jsx-props-no-spreading': 0,
    '@typescript-eslint/ban-ts-comment': [1, { 'ts-ignore': false }],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@types', path.resolve(__dirname, './src/types')],
          ['@api', path.resolve(__dirname, './src/api')],
          ['@components', path.resolve(__dirname, './src/components')],
          ['@hooks', path.resolve(__dirname, './src/hooks')],
          ['@config', path.resolve(__dirname, './src/config')],
          ['@i18n', path.resolve(__dirname, './src/i18n')],
          ['@models', path.resolve(__dirname, './src/models')],
          ['@actions', path.resolve(__dirname, './src/models/actions')],
          ['@res', path.resolve(__dirname, './src/res')],
          ['@utils', path.resolve(__dirname, './src/utils')],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  },
};

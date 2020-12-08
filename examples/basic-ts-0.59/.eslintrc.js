module.exports = {
  root: true,
  extends: ['./.eslintrc.base.js'],
  rules: {
    'import/no-unresolved': ['error', { ignore: ['^(react|react-native)$'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': 0,
    'react/jsx-filename-extension': 0,
    'react/sort-comp': [
      1,
      {
        order: [
          'static-variables',
          'static-methods',
          'lifecycle',
          '/^on.+$/',
          '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
          'everything-else',
          '/^render.+$/',
          'render',
        ],
      },
    ],
  },
  settings: {
    'import/core-modules': ['@tuya-rn/tuya-native-web-context'],
    'import/resolver': {
      alias: {
        map: [
          ['@api', './src/api'],
          ['@components', './src/components'],
          ['@config', './src/config'],
          ['@i18n', './src/i18n'],
          ['@models', './src/models'],
          ['@res', './src/res'],
          ['@utils', './src/utils'],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
      'react-native': { platform: 'both' },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.ios.js', '.android.js'],
      },
    },
  },
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      files: ['**/*.ts', '**/*.tsx'],
      env: { browser: true, es6: true, node: true },
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      plugins: ['react', 'react-native', 'prettier', '@typescript-eslint'],
      rules: {
        'react/prop-types': 0,
        'react/display-name': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-use-before-define': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/ban-ts-ignore': 0,
      },
    },
  ],
};

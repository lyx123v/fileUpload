// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['./.eslintrc.base.js'],
  plugins: ['react-hooks', 'react'],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  globals: {
    JSX: true,
    React: true,
  },
  settings: {
    react: {
      pragma: 'React',
      version: '18.2',
    },
  },
  rules: {
    'import/no-cycle': 'error',
    'react-hooks/rules-of-hooks': 'warn',
  },
};

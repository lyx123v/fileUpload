// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

const prettierrc = require('./.prettierrc');

module.exports = {
  parser: '@babel/eslint-parser',
  extends: [
    'standard',
    'prettier',
    './config/import.json',
    './config/no-restricted-syntax.json',
  ],
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      },
    },
  },
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      babelrc: false,
      configFile: false,
      cwd: __dirname,
      // your babel options
      presets: ['@babel/preset-env', '@babel/preset-react'],
    },
  },
  plugins: ['prettier', 'babel'],
  ignorePatterns: [
    '**/*.d.ts',
    '**/node_modules',
    '**/build',
    '**/dist',
    '**/es',
    '**/lib',
    '**/.codebase',
    '**/.changeset',
    '**/config',
    '**/common/scripts',
    '**/output',
    '*.bundle.js',
    '*.min.js',
    '*.js.map',
    '**/output',
    '**/*.log',
    '**/tsconfig.tsbuildinfo',
  ],
  rules: {
    // eslint-disable-next-line global-require
    'prettier/prettier': ['warn', prettierrc, { usePrettierrc: false }],
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        'unicorn/filename-case': 'off',
        'no-unused-vars': 'error',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['react', '@typescript-eslint', 'prettier', 'import', 'promise'],
      rules: { 'no-undef': 0 },
    },
    {
      files: ['package.json'],
      rules: {
        'prettier/prettier': 'off',
      },
    },
  ],
};

module.exports = {
  env: {
    es6: true,
  },
  extends: ['standard', 'plugin:prettier/recommended', 'prettier/standard'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {},
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [],
  rules: {
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxEOF: 0,
        maxBOF: 0,
      },
    ],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'block-like', next: 'export' },
    ],
    'no-void': [
      'error',
      {
        allowAsStatement: true,
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'standard-with-typescript',
        'prettier',
        'prettier/standard',
        'prettier/@typescript-eslint',
      ],
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: false },
        ],
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/consistent-type-assertions': [
          'error',
          {
            assertionStyle: 'as',
            objectLiteralTypeAssertions: 'allow',
          },
        ],
        '@typescript-eslint/array-type': ['error', { default: 'array' }],
        '@typescript-eslint/return-await': ['error', 'in-try-catch'],
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      files: ['**/.eslintrc.js'],
      parser: 'espree',
    },
  ],
}

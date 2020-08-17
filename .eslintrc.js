module.exports = {
  env: {
    es6: true
  },
  extends: [
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
  ],
  rules: {
    'no-multiple-empty-lines': ['error', {
      max: 1,
      maxEOF: 0,
      maxBOF: 0
    }],
    'padding-line-between-statements': ['error',
      { blankLine: 'always', prev: 'block-like', next: 'export' }
    ],
    'no-void': ['error', {
      allowAsStatement: true
    }]
  },
  overrides: [{
    files: ['*.ts', '*.tsx'],
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
    plugins: [
      '@typescript-eslint'
    ],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/require-await': 'off'
    }
  }, {
    files: ['**/.eslintrc.js'],
    parser: 'espree'
  }]
}

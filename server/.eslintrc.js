const path = require('path')

module.exports = {
  env: {
    node: true
  },
  plugins: [
  ],
  rules: {
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: path.dirname(__dirname),
    project: ['./tsconfig.json']
  },
  overrides: [{
    files: ['*.ts'],
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
    files: ['.eslintrc.js'],
    parser: 'espree'
  }]
}

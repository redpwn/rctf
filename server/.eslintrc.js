module.exports = {
  env: {
    node: true
  },
  plugins: [
  ],
  rules: {
  },
  parser: '@typescript-eslint/parser',
  overrides: [{
    files: ['*.ts'],
    extends: [
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    plugins: [
      '@typescript-eslint'
    ]
  }]
}

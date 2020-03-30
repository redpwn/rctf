module.exports = {
  env: {
    es6: true
  },
  extends: [
    'standard'
  ],
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
    }]
  }
}

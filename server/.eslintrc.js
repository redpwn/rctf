module.exports = {
  parser:  '@typescript-eslint/parser',
  env: {
    es6: true
  },
  extends: [
    'standard',
    'plugin:ava/recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    "typescript"
  ],
  rules: {
  }
}

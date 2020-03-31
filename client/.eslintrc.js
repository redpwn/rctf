module.exports = {
  env: {
    browser: true
  },
  extends: [
    'preact',

    // include standard again since preact sets style options which override
    // those of standard (see preactjs/eslint-config-preact#6)
    'standard'
  ],
  plugins: [
  ],
  rules: {
    radix: 'off',
    'jsx-quotes': ['error', 'prefer-single'],
    'no-multiple-empty-lines': ['error', { // override again because of reincluding standard
      max: 1,
      maxEOF: 0,
      maxBOF: 0
    }]
  }
}

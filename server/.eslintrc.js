module.exports = {
  env: {
    node: true
  },
  plugins: [
  ],
  rules: {
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json']
  },
  overrides: [{
    files: ['jest.*.js'],
    parser: 'espree'
  }]
}

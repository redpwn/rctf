module.exports = {
  env: {
    node: true,
  },
  plugins: [],
  rules: {},
  overrides: [
    {
      files: ['jest.*.js'],
      parser: 'espree',
    },
  ],
}

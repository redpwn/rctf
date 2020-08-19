module.exports = {
  extends: ['plugin:jest/recommended'],
  plugins: [],
  rules: {},
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
}

module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'standard-jsx',
    'prettier/standard',
    'prettier/react',
  ],
  plugins: [],
  rules: {
    radix: 'off',
    'react/react-in-jsx-scope': 'off', // We use ProvidePlugin
    'react/prop-types': 'off', // We have TypeScript and don't care about JS interop
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  overrides: [
    {
      files: ['lib/**/*', '*.config*.[jt]s?(x)'],
      parser: 'espree',
    },
    {
      files: ['*.test.[jt]s?(x)'],
      extends: [
        'plugin:jest/recommended',
        'plugin:testing-library/react',
        'plugin:jest-dom/recommended',
      ],
    },
  ],
  settings: {
    react: {
      // Set a recent React version to satisfy the plugin
      version: '16.13.1',
    },
  },
  ignorePatterns: ['index.js', 'index.d.ts'],
}

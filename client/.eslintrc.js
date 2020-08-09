module.exports = {
  env: {
    browser: true
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: [
  ],
  rules: {
    radix: 'off',
    'jsx-quotes': ['error', 'prefer-single'],
    'react/react-in-jsx-scope': 'off', // We use ProvidePlugin
    'react/prop-types': 'off' // We have TypeScript and don't care about JS interop
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json']
  },
  overrides: [{
    files: ['lib/**/*', '*.config*.js'],
    parser: 'espree'
  }],
  settings: {
    react: {
      // Set a recent React version to satisfy the plugin
      version: '16.13.1'
    }
  }
}

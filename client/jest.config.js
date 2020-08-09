module.exports = {
  testMatch: ['**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '@storybook/preact': '@storybook/react'
  },
  setupFiles: [
    '<rootDir>/lib/jest.setup.js'
  ]
}

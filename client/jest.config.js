module.exports = {
  testMatch: ['**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '^react$': 'preact/compat',
    '^react-dom$': 'preact/compat',
    '^@storybook/preact$': '@storybook/react'
  },
  snapshotSerializers: ['jest-serializer-html'],
  setupFiles: [
    '<rootDir>/lib/jest.setup.js'
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.[jt]s?(x)',
    '!**/*.stories.[jt]s?(x)'
  ]
}

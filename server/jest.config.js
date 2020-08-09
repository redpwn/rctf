module.exports = {
  testMatch: ['<rootDir>/test/**/*.[tj]s', '!**/[_.]*.*'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }],
        '@babel/preset-typescript'
      ]
    }]
  },
  setupFiles: [
    '<rootDir>/jest.setup.js'
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.js'
  ]
}

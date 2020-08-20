const base = require('../../jest.base.config.js')

module.exports = {
  ...base,
  testMatch: ['<rootDir>/test/**/*.[tj]s', '!**/[_.]*.*'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', {
      plugins: [
        ['const-enum', {
          transform: 'constObject'
        }]
      ],
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
    '<rootDir>/test/_setup.js'
  ]
}

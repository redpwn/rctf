const base = require('./jest.base.config.js')

module.exports = {
  ...base,
  projects: [
    'packages/client',
    'packages/server'
  ]
}

const mustache = require('mustache')
const { default: config } = require('../../../dist/server/config/client')

module.exports = function (source) {
  // FIXME: refactor this (copy-pasted from server)
  return mustache.render(source, {
    jsonConfig: JSON.stringify(config),
    config
  })
}

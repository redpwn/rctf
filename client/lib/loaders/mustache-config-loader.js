const mustache = require('mustache')
const config = require('../../../config/client')

module.exports = function (source) {
  // FIXME: refactor this (copy-pasted from server)
  return mustache.render(source, {
    jsonConfig: JSON.stringify(config),
    config
  })
}

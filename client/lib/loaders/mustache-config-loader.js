const mustache = require('mustache')

module.exports = function (source) {
  const config = require('../../../config/client')
  return mustache.render(source, {
    config: JSON.stringify(config),
    ctfName: config.ctfName,
    meta: config.meta
  })
}

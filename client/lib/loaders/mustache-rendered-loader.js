const loaderUtils = require('loader-utils')
const mustache = require('mustache')

module.exports = function (source) {
  return mustache.render(source, loaderUtils.getOptions(this))
}

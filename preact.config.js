require('dotenv').config()
const config = require('./config')

export default (webpackConfig, env, helpers) => {
  if (env.ssr) {
    return
  }
  const { plugin } = helpers.getPluginsByName(webpackConfig, 'HtmlWebpackPlugin')[0]
  plugin.options.view = {
    assetsPrefix: env.production ? '/static' : '',
    ctfName: config.ctfName
  }
}

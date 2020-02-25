require('dotenv').config()
const config = require('./config/server')
// The webpack base config has minicssextractplugin already loaded
const path = require('path')
const glob = require('glob')
const PurgecssPlugin = require('purgecss-webpack-plugin')

export default (webpackConfig, env, helpers) => {
  if (env.ssr) {
    return
  }
  if (env.production) {
    // Remove comment to disable sourcemaps
    // webpackConfig.devtool = false
  }
  webpackConfig.plugins.push(
    new PurgecssPlugin(
      {
        paths: glob.sync(path.join(__dirname, 'client/src/**/*'), { nodir: true })
      }
    ))
  // Remove .svg from preconfigured webpack file-loader
  const fileLoader = helpers.getLoadersByName(webpackConfig, 'file-loader')
  fileLoader.map(entry => { entry.rule.test = /\.(woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i })

  const urlLoader = helpers.getLoadersByName(webpackConfig, 'url-loader')
  urlLoader.map(entry => { entry.rule.test = /\.(woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i })

  webpackConfig.module.loaders.push(
    {
      test: /\.svg$/,
      loader: ['preact-svg-loader']
    }
  )
  const { plugin } = helpers.getPluginsByName(webpackConfig, 'HtmlWebpackPlugin')[0]
  plugin.options.view = {
    assetsPrefix: env.production ? '/static' : '',
    ctfName: config.ctfName
  }
}

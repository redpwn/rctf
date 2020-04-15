require('dotenv').config()
const appCfg = require('./config/client')

const glob = require('glob')

const PurgecssPlugin = require('purgecss-webpack-plugin')

export default (config, env, helpers) => {
  if (env.production) {
    // Disable sourcemaps
    config.devtool = false
  } else {
    config.devServer.proxy = {
      '/api': 'http://localhost:3000'
    }
  }

  // The webpack base config has minicssextractplugin already loaded
  config.plugins.push(
    new PurgecssPlugin({
      paths: glob.sync(env.source('**/*'), { nodir: true }),

      // PurgeCSS does not correctly correctly recognize selectors of the form
      // `[class*=" btn-"], [class^="btn-"]` that Cirrus uses extensively; it
      // also does not recognize the comparison in the attribute selector and
      // only picks up on `class`, so we have to whitelist all `class`
      // selectors as we cannot target only the `btn-` selectors that are being
      // improperly removed.
      whitelistPatternsChildren: [/class.*/]
    })
  )

  // Remove .svg from preconfigured webpack file-loader
  ;['file-loader', 'url-loader']
    .flatMap(name => helpers.getLoadersByName(config, name))
    .forEach(entry => {
      entry.rule.test = /\.(woff2?|ttf|eot|jpe?g|png|webp|gif|mp4|mov|ogg|webm)(\?.*)?$/i
    })

  config.module.rules.push({
    test: /\.svg$/,
    loader: 'svg-sprite-loader',
    options: {
      runtimeGenerator: require.resolve('./client/lib/svg-icon-component-generator'),
      runtimeOptions: {
        iconModule: './components/icon'
      }
    }
  })

  const HtmlWebpackPluginWrapper = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0]
  if (HtmlWebpackPluginWrapper !== undefined) {
    const HtmlWebpackPlugin = HtmlWebpackPluginWrapper.plugin
    HtmlWebpackPlugin.options.view = {
      ctfName: appCfg.ctfName,
      meta: appCfg.meta
    }
  }

  const SizePluginWrapper = helpers.getPluginsByName(config, 'SizePlugin')[0]
  if (SizePluginWrapper !== undefined) {
    SizePluginWrapper.plugin.options = {
      ...SizePluginWrapper.plugin.options,
      stripHash: (filename) => {
        const regex = /\.[0-9a-f]+\.((esm\.)?js|css)/
        const match = filename.match(regex)
        if (match === null) {
          return filename
        }
        return filename.slice(0, match.index) + '.' + match[1]
      }
    }
  }
}

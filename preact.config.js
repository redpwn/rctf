require('dotenv').config()

const path = require('path')
const glob = require('glob')
const assert = require('assert').strict

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

  config.resolveLoader.modules.unshift(path.resolve(__dirname, 'client/lib/loaders'))

  const { rule: { options: babelConfig } } = helpers.getLoadersByName(config, 'babel-loader')[0]
  babelConfig.plugins.push('transform-export-extensions')

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

  if (!env.production) {
    const HtmlWebpackPluginsWrappers = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')
    for (const HtmlWebpackPluginWrapper of HtmlWebpackPluginsWrappers) {
      const options = HtmlWebpackPluginWrapper.plugin.options
      const loaderMatch = options.template.match(/^!!ejs-loader!(.*)$/)
      assert(loaderMatch !== null)

      options.template = `!!ejs-loader!mustache-config-loader!${loaderMatch[1]}`
    }
  }

  const CopyPluginWrapper = helpers.getPluginsByName(config, 'CopyPlugin')[0]
  if (CopyPluginWrapper !== undefined) {
    const plugin = CopyPluginWrapper.plugin
    plugin.patterns = plugin.patterns.filter(({ from }) => {
      return !/node_modules[\\/]preact-cli[\\/]lib[\\/]resources[\\/](manifest.json|icon.png)$/.test(from)
    })
  }
}

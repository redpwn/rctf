const webpack = require('webpack')

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-actions/register',
    '@storybook/addon-knobs/register'
  ],
  webpackFinal: config => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        jsx: ['theme-ui', 'jsx'],
        Fragment: ['react', 'Fragment']
      })
    )

    return config
  }
}

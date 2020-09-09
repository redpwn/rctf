const webpack = require('webpack')

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-knobs',
    '@storybook/addon-actions',
    '@storybook/addon-a11y',
  ],
  webpackFinal: config => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        jsx: ['theme-ui', 'jsx'],
        Fragment: ['react', 'Fragment'],
      })
    )

    return config
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: {
        skipPropsWithName: ['as', 'id'],
      },
    },
  },
}

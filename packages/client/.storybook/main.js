const path = require('path')

// Workaround for conflicting emotion versions (SB v10 vs theme-ui v11)
// https://github.com/storybookjs/storybook/pull/13300#issuecomment-783268111
const rootModules = path.resolve(__dirname, '../../../node_modules')

const updateEmotionAliases = config => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      '@emotion/core': path.join(rootModules, '@emotion/react'),
      '@emotion/styled': path.join(rootModules, '@emotion/styled'),
      '@emotion/styled-base': path.join(rootModules, '@emotion/styled'),
      'emotion-theming': path.join(rootModules, '@emotion/react'),
    },
  },
})

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  core: {
    builder: 'webpack5',
  },
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-knobs',
    '@storybook/addon-actions',
    '@storybook/addon-a11y',
  ],
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
  webpackManager: updateEmotionAliases,
  webpackFinal: updateEmotionAliases,
}

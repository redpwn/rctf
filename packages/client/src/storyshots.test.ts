import path from 'path'
import initStoryshots from '@storybook/addon-storyshots'
import { shallowRender } from 'preact-render-to-string'

initStoryshots({
  configPath: path.resolve(__dirname, '../.storybook'),
  framework: 'preact',
  renderer: shallowRender,
})

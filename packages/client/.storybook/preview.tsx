import { ComponentType } from 'react'
import { withKnobs } from '@storybook/addon-knobs'
import { ThemeProvider } from 'theme-ui'
import theme from '../src/util/theme'

export const decorators =
  process.env.NODE_ENV !== 'test'
    ? [
        withKnobs,
        (Story: ComponentType) => (
          <ThemeProvider theme={theme}>
            <Story />
          </ThemeProvider>
        ),
      ]
    : []

export const parameters = {
  layout: 'centered',
}

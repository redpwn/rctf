import { addDecorator } from '@storybook/react'
import centered from '@storybook/addon-centered/react'
import { withKnobs } from '@storybook/addon-knobs'
import { ThemeProvider } from 'theme-ui'
import theme from '../src/util/theme'

if (process.env.NODE_ENV !== 'test') {
  addDecorator(withKnobs)
  addDecorator(story =>
    <ThemeProvider theme={theme}>
      {story()}
    </ThemeProvider>
  )
  addDecorator(centered)
}

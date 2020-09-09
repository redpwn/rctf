import '@testing-library/jest-dom/extend-expect'

import { render } from '@testing-library/preact'

import Card from './card'

import { FunctionComponent } from 'react'
import { useThemeUI, ThemeProvider } from 'theme-ui'
import theme from '../util/theme'

const ThemeColorDisplayer: FunctionComponent<{
  color: string
}> = ({ color, ...props }) => {
  const { theme } = useThemeUI()

  return <div {...props}>{theme.colors?.[color] ?? 'undefined'}</div>
}

test('default background color is cardBackground', () => {
  const { queryByTestId } = render(
    <ThemeProvider
      theme={{
        ...theme,
        colors: {
          background: 'badcolor',
          cardBackground: 'testcolor1',
        },
      }}
    >
      <Card>
        <ThemeColorDisplayer color='background' data-testid='colordisplayer' />
      </Card>
    </ThemeProvider>
  )

  expect(queryByTestId('colordisplayer')).toHaveTextContent('testcolor1')
})

test('background color respects theme', () => {
  const { queryByTestId } = render(
    <ThemeProvider
      theme={{
        ...theme,
        colors: {
          background: 'badcolor',
          custom: 'testcolor2',
        },
      }}
    >
      <Card bg='custom'>
        <ThemeColorDisplayer color='background' data-testid='colordisplayer' />
      </Card>
    </ThemeProvider>
  )

  expect(queryByTestId('colordisplayer')).toHaveTextContent('testcolor2')
})

test('background color not in theme should be passed through', () => {
  const { queryByTestId } = render(
    <ThemeProvider
      theme={{
        ...theme,
        colors: {
          background: 'badcolor',
        },
      }}
    >
      <Card bg='testcolor3'>
        <ThemeColorDisplayer color='background' data-testid='colordisplayer' />
      </Card>
    </ThemeProvider>
  )

  expect(queryByTestId('colordisplayer')).toHaveTextContent('testcolor3')
})

import '@testing-library/jest-dom/extend-expect'
import { matchers } from '@emotion/jest'

import { render, screen } from '@testing-library/preact'

import Card from './card'

import { useThemeUI, ThemeProvider, Theme } from 'theme-ui'
import theme from '../util/theme'

expect.extend(matchers)

const ThemeColorDisplayer = ({
  color,
  ...props
}: { color: string } & Omit<JSX.IntrinsicElements['div'], 'sx'>) => {
  const { theme } = useThemeUI()

  return (
    <div {...props} sx={{ color }}>
      {theme.rawColors?.[color] ?? 'undefined'}
    </div>
  )
}

const runBgColorTest = ({
  themeColors,
  cardBg,
  expectedColor,
}: {
  themeColors: Theme['colors']
  cardBg?: string
  expectedColor: string
}) => {
  const run = (
    useCustomProperties: boolean,
    doExpect: (e: HTMLElement) => void
  ) => {
    render(
      <ThemeProvider
        theme={{
          ...theme,
          config: {
            ...theme.config,
            useCustomProperties,
          },
          colors: themeColors,
        }}
      >
        <Card bg={cardBg}>
          <ThemeColorDisplayer
            color='background'
            data-testid='colordisplayer'
          />
        </Card>
      </ThemeProvider>
    )

    doExpect(screen.getByTestId('colordisplayer'))
  }

  test('with CSS variables', () =>
    run(true, e => expect(e).toHaveTextContent(expectedColor)))
  test('without CSS variables', () =>
    run(false, e => expect(e).toHaveStyleRule('color', expectedColor)))
}

describe('default background color is cardBackground', () => {
  runBgColorTest({
    themeColors: {
      background: 'badcolor',
      cardBackground: 'testcolor1',
    },
    expectedColor: 'testcolor1',
  })
})

describe('background color respects theme', () => {
  runBgColorTest({
    themeColors: {
      background: 'badcolor',
      custom: 'testcolor2',
    },
    cardBg: 'custom',
    expectedColor: 'testcolor2',
  })
})

describe('background color not in theme should be passed through', () => {
  runBgColorTest({
    themeColors: {
      background: 'badcolor',
    },
    cardBg: 'testcolor3',
    expectedColor: 'testcolor3',
  })
})

test('misc theme properties are kept', () => {
  const space = [0, 4, 8, 16, 32, 64]

  const SpaceDumper = (props: JSX.IntrinsicElements['div']) => {
    const { theme } = useThemeUI()

    return <div {...props}>{JSON.stringify(theme.space)}</div>
  }

  render(
    <ThemeProvider
      theme={{
        ...theme,
        space,
      }}
    >
      <Card>
        <SpaceDumper data-testid='spacedumper' />
      </Card>
    </ThemeProvider>
  )

  expect(screen.getByTestId('spacedumper')).toHaveTextContent(
    JSON.stringify(space)
  )
})

test('does not die when outside of ThemeProvider', () => {
  render(<Card data-testid='card' />)
  expect(screen.queryByTestId('card')).toBeInTheDocument()
})

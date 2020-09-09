import { useMemo, forwardRef, ComponentProps } from 'react'
import { Card as ThemeUICard, ThemeProvider, useThemeUI } from 'theme-ui'
import { ExtractRefType } from '../util/react-types'

export interface CardProps extends ComponentProps<typeof ThemeUICard> {
  bg?: string
}

export const Card = forwardRef<ExtractRefType<CardProps>, CardProps>(
  ({ bg = 'cardBackground', children, ...props }, forwardedRef) => {
    const { theme } = useThemeUI()

    const newTheme = useMemo(() => {
      // Don't die in test render environment with no theme provider
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (theme === null) return theme

      return {
        ...theme,
        colors: {
          ...theme.colors,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          background: bg in theme.colors! ? theme.colors![bg] : bg,
        },
      }
    }, [theme, bg])

    return (
      <ThemeProvider theme={newTheme}>
        <ThemeUICard bg='background' {...props} ref={forwardedRef}>
          {children}
        </ThemeUICard>
      </ThemeProvider>
    )
  }
)

Card.displayName = 'Card'

export default Card

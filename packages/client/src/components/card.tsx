import { useCallback, forwardRef, ComponentProps } from 'react'
import { Card as ThemeUICard, ThemeProvider, Theme } from 'theme-ui'
import { ExtractRefType } from '../util/react-types'

export interface CardProps extends ComponentProps<typeof ThemeUICard> {
  bg?: string
}

export const Card = forwardRef<ExtractRefType<CardProps>, CardProps>(
  ({ bg = 'cardBackground', children, ...props }, forwardedRef) => {
    const themeTransformer = useCallback(
      (theme: Theme) => ({
        ...theme,
        colors:
          theme.colors &&
          ({
            ...theme.colors,
            background: theme.colors[bg] ?? bg,
            // TODO: make this less hacky
          } as typeof theme.colors),
        rawColors:
          theme.rawColors &&
          ({
            ...theme.rawColors,
            background: theme.rawColors[bg] ?? bg,
          } as typeof theme.rawColors),
      }),
      [bg]
    )

    return (
      <ThemeProvider theme={themeTransformer}>
        <ThemeUICard bg='background' {...props} ref={forwardedRef}>
          {children}
        </ThemeUICard>
      </ThemeProvider>
    )
  }
)

Card.displayName = 'Card'

export default Card

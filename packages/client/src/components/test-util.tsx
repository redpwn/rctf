import { FunctionComponent } from 'react'
import { ThemeProvider } from 'theme-ui'
import theme from '../util/theme'
import {
  render as baseRender,
  Queries,
  RenderOptions,
  RenderResult,
} from '@testing-library/preact'

const AllProviders: FunctionComponent = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

export function render(
  ui: JSX.Element,
  options?: Omit<RenderOptions, 'queries'>
): RenderResult
export function render<Q extends Queries>(
  ui: JSX.Element,
  options: RenderOptions<Q>
): RenderResult<Q>
export function render<Q extends Queries>(
  ui: JSX.Element,
  options?: RenderOptions<Q> | Omit<RenderOptions, 'queries'>
): RenderResult<Q> | RenderResult {
  return baseRender<Q>(ui, { wrapper: AllProviders, ...options })
}

import { FunctionComponent } from 'react'
import { boolean, text } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { Grid } from 'theme-ui'

import Button from './button'

export default {
  title: 'Button',
  component: Button
}

export const button: FunctionComponent = () =>
  <Button
    disabled={boolean('Disabled', false)}
    onClick={action('clicked')}
    variant={text('Variant', 'primary')}
  >
    {text('Content', 'Hello World!')}
  </Button>

export const Buttons: FunctionComponent = () =>
  <Grid gap={2} columns={3}>
    {[1, 2, 3].map(n =>
      <Button onClick={action(n.toString())} key={n}>Button {n}</Button>
    )}
  </Grid>

export const DisabledButton: FunctionComponent = () =>
  <Button
    disabled
    variant={text('Variant', 'primary')}
  >
    Button
  </Button>

export const FocusedButton: FunctionComponent = () =>
  <Button
    autoFocus
    variant={text('Variant', 'primary')}
  >
    Button
  </Button>

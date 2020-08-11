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
    outline={boolean('Outline', false)}
  >
    {text('Content', 'Hello World!')}
  </Button>

export const Buttons: FunctionComponent = () => {
  const outline = boolean('Outline', false)
  const variant = text('Variant', 'primary')
  const disabled = boolean('Disabled', false)

  const no2Disabled = boolean('Disabled (#2 only)', false)

  return (
    <Grid gap={2} columns={3}>
      {[1, 2, 3].map(n =>
        <Button
          onClick={action(n.toString())}
          key={n}
          variant={variant}
          outline={outline}
          disabled={disabled || (n === 2 && no2Disabled)}
        >
          Button {n}
        </Button>
      )}
    </Grid>
  )
}

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

export const OutlineButton: FunctionComponent = () =>
  <Button
    disabled={boolean('Disabled', false)}
    variant={text('Variant', 'primary')}
    outline
  >
    Button
  </Button>

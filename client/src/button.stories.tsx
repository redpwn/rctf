import { FunctionComponent } from 'react'
import { boolean, text } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { Button } from 'theme-ui'

export default {
  title: 'Button'
}

export const button: FunctionComponent = () =>
  <Button
    disabled={boolean('Disabled', false)}
    onClick={action('clicked')}
    variant={text('Variant', 'primary')}
  >
    {text('Content', 'Hello World!')}
  </Button>

export const disabledButton: FunctionComponent = () =>
  <Button disabled={true}>Disabled</Button>

export const dangerButton: FunctionComponent = () =>
  <Button variant='danger'>Danger!</Button>

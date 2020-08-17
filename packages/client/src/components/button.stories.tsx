import { Story } from '@storybook/react'
import { AugmentArgs } from '../sb-util'
import { action } from '@storybook/addon-actions'
import { Grid } from 'theme-ui'

import Button, { ButtonProps } from './button'

export default {
  title: 'Button',
  component: Button
}

const Template: Story<ButtonProps & { content: string }> = ({ content, ...props }) =>
  <Button {...props}>
    {content}
  </Button>

export const Default = Template.bind({})

Default.args = {
  content: 'Button',
  onClick: action('onClick')
}

export const Buttons: AugmentArgs<typeof Template, { no2Disabled: boolean }> = ({
  disabled,
  no2Disabled,
  ...props
}) =>
  <Grid gap={2} columns={3}>
    {[1, 2, 3].map(n =>
      <Template {...props} key={n} disabled={disabled || (n === 2 && no2Disabled)} />
    )}
  </Grid>

Buttons.args = {
  ...Default.args,
  no2Disabled: false
}

export const Disabled = Template.bind({})

Disabled.args = {
  ...Default.args,
  disabled: true
}

export const Focused: typeof Template = props => <Template autoFocus {...props} />

Focused.args = { ...Default.args }

export const Outline = Template.bind({})

Outline.args = {
  ...Default.args,
  outline: true
}

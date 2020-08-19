import { Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import LoginCard, { LoginCardProps } from './login-card'

export default {
  title: 'Login Card',
  component: LoginCard,
}

export const Default: Story<LoginCardProps> = props => (
  <LoginCard
    sx={{
      maxWidth: '500px',
      width: '100%',
    }}
    {...props}
  />
)

Default.args = {
  ctfName: 'testCTF',
  onTokenLogin: action('onTokenLogin'),
  onCtftimeLogin: action('onCtftimeLogin'),
}

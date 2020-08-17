import { Story } from '@storybook/react'
import { Box } from 'theme-ui'
import Card from './card'

export default {
  title: 'Card',
  component: Card
}

export const Default: Story = props =>
  <Card {...props}>
    <Box bg='red'>
      <Box bg='background'>
        Test content
      </Box>
    </Box>
  </Card>

import { FunctionComponent, ReactElement } from 'react'
import { action } from '@storybook/addon-actions'
import { select } from '@storybook/addon-knobs'
import { Box } from 'theme-ui'
import { NavBar, NavElement } from './navbar'

type StoryFn = () => ReactElement

export default {
  title: 'Navbar',
  component: NavBar,
  decorators: process.env.NODE_ENV === 'test' ? [] : [
    (story: StoryFn): ReactElement =>
      <Box sx={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%'
      }}
      >
        {story()}
      </Box>
  ]
}

export const navbar: FunctionComponent = () => {
  const selected = select('Active', [null, 0, 1], null)
  return (
    <NavBar>
      <NavElement active={selected === 0} as='a' href='#' onClick={action('Nav1')}>Nav1</NavElement>
      <NavElement active={selected === 1} as='a' href='#' onClick={action('Nav2')}>Nav2</NavElement>
    </NavBar>
  )
}

export const selectedNavElement: FunctionComponent = () =>
  <NavBar>
    <NavElement active as='a' href='#'>Nav1</NavElement>
    <NavElement as='a' href='#'>Nav2</NavElement>
  </NavBar>

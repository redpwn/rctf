import { FunctionComponent, ComponentType, ElementType } from 'react'
import { Flex, Box } from 'theme-ui'
import { NavLink as RouterNavLink, Link } from 'react-router-dom'

type ExtractProps<Component> =
  Component extends ComponentType<infer PropType>
    ? PropType
    : Component

export const NavElement: FunctionComponent<{
  as: ElementType
  active?: boolean,
  [k: string]: unknown
}> = ({ active, children, ...props }) =>
  <Box {...props} sx={{
    fontFamily: 'heading',
    color: 'text',
    textDecoration: 'none',
    p: 2,
    position: 'relative',
    '&::after': {
      display: 'block',
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: 2,
      bg: 'primary',
      opacity: () => active ? 1 : 0,
      transition: 'all 300ms'
    },
    '&:hover::after, &:focus::after, &.active::after': {
      opacity: 1
    },
    '&:active::after': {
      opacity: 0.8,
      transition: 'all 200ms'
    },
    '&:focus': {
      outline: 'none'
    }
  }}>
    {children}
  </Box>

export const NavLink: FunctionComponent<ExtractProps<typeof Link>> = ({ ...props }) =>
  <NavElement {...props} as={RouterNavLink} activeClassName='active' />

export const NavBar: FunctionComponent = ({ children }) =>
  <Flex as='nav' sx={{
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch'
  }}>
    {children}
  </Flex>

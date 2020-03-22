import { useLayoutEffect } from 'preact/hooks'
import {logout} from '../api/auth'
import 'linkstate/polyfill'

export default () => {
  useLayoutEffect(logout)
  return null
}

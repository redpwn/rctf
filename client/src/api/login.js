import preactLocalStorage from 'preact-localstorage'
import { route } from 'preact-router'

export const login = teamToken => {
  preactLocalStorage.set('token', 'AUTH_TOKEN_HERE')
  route('/challenges')
}

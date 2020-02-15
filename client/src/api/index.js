import { route } from 'preact-router'
import preactLocalStorage from 'preact-localstorage'

const badToken = () => {
  preactLocalStorage.get('token', 'AUTH_TOKEN_HERE')
  route('/login')
}

export const request = (method, endpoint, data) => {
  // fetch endpoint with HTTP method, data as body

  badToken()
}

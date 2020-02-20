import { request } from './util'

export const privateProfile = () => {
  return request('GET', '/users/me')
    .then(resp => resp.data)
}

import { request } from './util'

export const privateProfile = () => {
  return request('GET', '/users/me')
    .then(resp => resp.data)
}

export const publicProfile = uuid => {
  return request('GET', '/users/' + uuid)
    .then(resp => resp.data)
}

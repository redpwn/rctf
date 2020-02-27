import { request, relog } from './util'

export const privateProfile = () => {
  return request('GET', '/users/me')
    .then(resp => resp.data)
}

export const publicProfile = uuid => {
  return request('GET', '/users/' + encodeURIComponent(uuid))
    .then(resp => resp.data)
}

export const deleteAccount = () => {
  return request('DELETE', '/users/me')
    .then(resp => {
      switch (resp.kind) {
        case 'goodUserDelete':
          return relog()
      }
    })
}

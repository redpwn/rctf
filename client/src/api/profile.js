import { request, relog } from './util'

export const privateProfile = () => {
  return request('GET', '/users/me')
    .then(resp => resp.data)
}

export const publicProfile = uuid => {
  return request('GET', `/users/${encodeURIComponent(uuid)}`)
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

export const updateAccount = (name, division) => {
  return request('PATCH', '/users/me', {
    name,
    division: Number.parseInt(division)
  })
    .then(resp => resp.data)
}

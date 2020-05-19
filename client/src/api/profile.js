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

export const updateAccount = ({ name, division }) => {
  return request('PATCH', '/users/me', {
    name,
    division: division === undefined ? undefined : Number.parseInt(division)
  })
    .then(resp => {
      switch (resp.kind) {
        case 'goodUserUpdate':
          return {
            data: resp.data
          }
        default:
          return {
            error: resp.message
          }
      }
    })
}

export const updateEmail = ({ email }) => {
  return request('PUT', '/users/me/auth/email', {
    email
  })
    .then(resp => {
      switch (resp.kind) {
        default:
          return {
            error: resp.message
          }
        case 'goodVerifySent':
          return {
            data: resp.message
          }
      }
    })
}

export const deleteEmail = () => {
  return request('DELETE', '/users/me/auth/email')
    .then(resp => {
      switch (resp.kind) {
        case 'badZeroAuth':
          return {
            error: resp.message
          }
        // If the email did not exist, still a "success" in that no more email
        case 'badEmailNoExists':
        case 'goodEmailRemoved':
          return {
            data: resp.message
          }
      }
    })
}

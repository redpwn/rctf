import { request } from './util'

export const getMembers = () => {
  return request('GET', '/users/me/members')
    .then(resp => resp.data)
}

export const addMember = ({ name, email, grade }) => {
  return request('POST', '/users/me/members', { name, email, grade })
    .then(resp => {
      switch (resp.kind) {
        case 'badKnownEmail':
          return {
            error: resp.message
          }
        case 'goodMemberCreate':
          return {
            data: resp.data
          }
        default:
          return {
            error: 'Unknown error'
          }
      }
    })
}

export const removeMember = ({ id }) => {
  return request('DELETE', `/users/me/members/${encodeURIComponent(id)}`)
    .then(resp => resp.data)
}

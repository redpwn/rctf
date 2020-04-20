import { request } from './util'

export const getMembers = () => {
  return request('GET', '/users/members')
    .then(resp => resp.data)
}

export const addMember = ({ name, email, grade }) => {
  return request('POST', '/users/members/new', { name, email, grade })
    .then(resp => {
      switch (resp.kind) {
        case 'badKnownEmail':
          return {
            err: resp.message
          }
        case 'goodMemberCreate':
          return {
            data: resp.data
          }
        default:
          return {
            err: 'Unknown error'
          }
      }
    })
}

export const removeMember = ({ id }) => {
  return request('DELETE', `/users/members/${encodeURIComponent(id)}`)
    .then(resp => resp.data)
}

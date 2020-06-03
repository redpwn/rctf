import { request } from './util'

export const getMembers = async () => {
  return (await request('GET', '/users/me/members')).data
}

export const addMember = async ({ email }) => {
  const resp = await request('POST', '/users/me/members', { email })
  switch (resp.kind) {
    case 'badEmail':
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
}

export const removeMember = async ({ id }) => {
  return (await request('DELETE', `/users/me/members/${encodeURIComponent(id)}`)).data
}

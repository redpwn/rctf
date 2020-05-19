import { request, relog } from './util'

export const privateProfile = async () => {
  return (await request('GET', '/users/me')).data
}

export const publicProfile = async (uuid) => {
  return (await request('GET', `/users/${encodeURIComponent(uuid)}`)).data
}

export const deleteAccount = async () => {
  const resp = await request('DELETE', '/users/me')
  switch (resp.kind) {
    case 'goodUserDelete':
      return relog()
  }
}

export const updateAccount = async ({ name, division }) => {
  const resp = await request('PATCH', '/users/me', {
    name,
    division: Number.parseInt(division)
  })
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
}

export const updateEmail = async ({ email }) => {
  const resp = await request('PUT', '/users/me/auth/email', {
    email
  })
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
}

export const deleteEmail = async () => {
  const resp = await request('DELETE', '/users/me/auth/email')
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
}

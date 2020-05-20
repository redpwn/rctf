import { request, relog, handleResponse } from './util'

export const privateProfile = async () => {
  const resp = await request('GET', '/users/me')

  return handleResponse({ resp, valid: ['goodUserData'] })
}

export const publicProfile = async (uuid) => {
  const resp = await request('GET', `/users/${encodeURIComponent(uuid)}`)

  return handleResponse({ resp, valid: ['goodUserData'] })
}

export const deleteAccount = async () => {
  const resp = await request('DELETE', '/users/me')

  switch (resp.kind) {
    case 'goodUserDelete':
      return relog()
    default:
      return {
        error: resp.message
      }
  }
}

export const updateAccount = async ({ name, division }) => {
  const resp = await request('PATCH', '/users/me', {
    name,
    division: division === undefined ? undefined : Number.parseInt(division)
  })

  return handleResponse({ resp, valid: ['goodUserUpdate'] })
}

export const updateEmail = async ({ email }) => {
  const resp = await request('PUT', '/users/me/auth/email', {
    email
  })

  return handleResponse({ resp, valid: ['goodVerifySent', 'goodEmailSet'], resolveDataMessage: true })
}

export const deleteEmail = async () => {
  const resp = await request('DELETE', '/users/me/auth/email')

  // If the email did not exist, still a "success" in that no more email
  return handleResponse({ resp, valid: ['goodEmailRemoved', 'badEmailNoExists'], resolveDataMessage: true })
}

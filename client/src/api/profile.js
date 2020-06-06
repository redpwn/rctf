import config from '../config'
import { request, handleResponse } from './util'

export const privateProfile = async () => {
  const resp = await request('GET', '/users/me')

  return handleResponse({ resp, valid: ['goodUserData'] })
}

export const pendingPrivateProfile = async ({ authToken }) => {
  const { data } = await (await fetch(`${config.apiEndpoint}/users/me`, {
    headers: {
      authorization: `Bearer ${authToken}`
    }
  })).json()

  return data
}

export const publicProfile = async (uuid) => {
  const resp = await request('GET', `/users/${encodeURIComponent(uuid)}`)

  return handleResponse({ resp, valid: ['goodUserData'] })
}

export const updateAccount = async ({ name, division }) => {
  const resp = await request('PATCH', '/users/me', {
    name,
    division: division === undefined ? undefined : Number.parseInt(division)
  })

  if (resp.kind === 'badRateLimit') {
    const ms = resp.data.timeLeft
    const sec = Math.floor(ms / 1000)
    const min = Math.floor(sec / 60)

    let msg
    if (min === 0) {
      msg = `${sec} seconds`
    } else {
      msg = `${min} minutes`
    }

    return {
      error: `Please wait ${msg} before trying this again`
    }
  }

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

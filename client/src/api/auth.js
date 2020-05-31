import { request } from './util'
import { route } from 'preact-router'

export const login = async ({ teamToken, ctftimeToken }) => {
  const resp = await request('POST', '/auth/login', {
    teamToken,
    ctftimeToken
  })
  switch (resp.kind) {
    case 'goodLogin':
      localStorage.setItem('token', resp.data.authToken)
      route('/challs')
      return
    case 'badTokenVerification':
      return {
        teamToken: resp.message
      }
    case 'badUnknownUser':
      return {
        badUnknownUser: true
      }
    default:
      return {
        teamToken: 'Unknown response from server, please contact ctf administrator'
      }
  }
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('teamToken')

  return route('/')
}

export const verify = async ({ verifyToken }) => {
  const resp = await request('POST', '/auth/verify', {
    verifyToken
  })
  switch (resp.kind) {
    case 'goodVerify':
      localStorage.setItem('token', resp.data.authToken)
      route('/challs')

      return {}
    case 'badTokenVerification':
    case 'badUnknownUser':
      return {
        verifyToken: resp.message
      }
    default:
      return {
        verifyToken: 'Unknown response from server, please contact ctf administrator'
      }
  }
}

export const register = async ({ email, name, division, ctftimeToken }) => {
  const resp = await request('POST', '/auth/register', {
    email,
    name,
    division: Number.parseInt(division),
    ctftimeToken
  })
  switch (resp.kind) {
    case 'goodRegister':
      localStorage.setItem('token', resp.data.authToken)
      localStorage.setItem('teamToken', resp.data.teamToken)

      return route('/profile')
    case 'goodVerifySent':
      return route('/verify')
    case 'badEmail':
    case 'badKnownEmail':
      return {
        errors: {
          email: resp.message
        }
      }
    case 'badKnownName':
      return {
        errors: {
          name: resp.message
        },
        data: resp.data
      }
    case 'badName':
      return {
        errors: {
          name: resp.message
        }
      }
  }
}

export const ctftimeCallback = ({ ctftimeCode }) => {
  return request('POST', '/integrations/ctftime/callback', {
    ctftimeCode
  })
}

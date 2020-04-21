import { request } from './util'
import { route } from 'preact-router'

export const login = ({ teamToken, ctftimeToken }) => {
  return request('POST', '/auth/login', {
    teamToken,
    ctftimeToken
  })
    .then(resp => {
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
    })
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('teamToken')

  return route('/')
}

export const verify = ({ verifyToken }) => {
  return request('POST', '/auth/verify', {
    verifyToken
  })
    .then(resp => {
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
    })
}

export const register = ({ email, name, division, ctftimeToken }) => {
  return request('POST', '/auth/register', {
    email,
    name,
    division: Number.parseInt(division),
    ctftimeToken
  })
    .then(resp => {
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
            email: resp.message
          }
        case 'badKnownName':
          return {
            name: resp.message
          }
      }
    })
}

export const ctftimeCallback = ({ ctftimeCode }) => {
  return request('POST', '/integrations/ctftime/callback', {
    ctftimeCode
  })
}

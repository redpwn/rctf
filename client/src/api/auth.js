import { request } from './util'
import { route } from 'preact-router'

export const login = ({ teamToken }) => {
  return request('POST', '/auth/login', {
    teamToken
  })
    .then(resp => {
      switch (resp.kind) {
        case 'goodLogin':
          localStorage.setItem('token', resp.data.authToken)
          return route('/challs')
        case 'badTokenVerification':
          return {
            teamToken: resp.message
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
          route('/challenges')

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

export const register = ({ email, name, division }) => {
  return request('POST', '/auth/register', {
    email,
    name,
    division: Number.parseInt(division)
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

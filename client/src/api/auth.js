import { request } from './index'
import { route } from 'preact-router'

export const login = ({ teamToken }) => {
  return request('POST', '/auth/login', {
    teamToken
  })
    .then(resp => {
      switch (resp.kind) {
        case 'goodLogin':
          localStorage.setItem('token', resp.data.authToken)
          return route('/challenges')
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

export const register = ({ email, name, division }) => {
  return request('POST', '/auth/submit', {
    email,
    name,
    division: Number.parseInt(division),
    register: true
  })
    .then(resp => {
      switch (resp.kind) {
        case 'verifyEmail':
          localStorage.setItem('token', resp.data.authToken)
          localStorage.setItem('teamToken', resp.data.teamToken)

          return route('/profile')
        case 'badEmail':
        case 'badKnownEmail':
          return {
            email: resp.message
          }
      }
    })
}

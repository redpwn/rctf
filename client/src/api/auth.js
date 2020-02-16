import { request } from './index'

export const login = ({ teamToken }) => {
  return request('POST', '/auth/login', {
    teamToken
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
      if (resp.kind === 'verifyEmail') {
        localStorage.setItem('token', resp.data.authToken)
        localStorage.setItem('teamToken', resp.data.teamToken)
      }
    })
}

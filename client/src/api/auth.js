import { request } from './index'

export const login = ({ teamToken }) => {
  return request('POST', '/auth/verify', {
    teamToken
  })
}

export const signup = ({ email, name, division, register }) => {
  return request('POST', '/auth/signup', {
    email,
    name,
    division
  })
}

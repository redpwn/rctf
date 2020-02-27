import { route } from 'preact-router'
import config from '../../../config/client'

export const relog = () => {
  localStorage.removeItem('token')
  route('/register')
}

export const request = (method, endpoint, data) => {
  return fetch(config.apiEndpoint + endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify(data)
  })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.kind === 'badToken') return relog()

      return resp
    })
    .catch(err => {
      console.debug(err)
    })
}

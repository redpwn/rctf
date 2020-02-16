import { route } from 'preact-router'
import config from '../config'

const badToken = () => {
  localStorage.removeItem('token')
  route('/login')
}

export const request = (method, endpoint, data) => {
  // fetch endpoint with HTTP method, data as body
  return fetch(config.apiEndpoint + endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify(data)
  })
    .json()
    .catch(err => {
      console.debug(err)
      badToken()
    })
}

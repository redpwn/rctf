import { route } from 'preact-router'
import config from '../config'

const badToken = () => {
  localStorage.removeItem('token')
  route('/login')
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
    .catch(err => {
      console.debug(err)
      badToken()
    })
}

import { route } from 'preact-router'
import config from '../config'

const relog = () => {
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
    .then(data => {
      if (data.kind === 'badToken') return relog()

      return data
    })
    .catch(err => {
      console.debug(err)
    })
}

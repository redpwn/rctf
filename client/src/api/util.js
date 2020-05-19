import { route } from 'preact-router'
import config from '../config'

export const relog = () => {
  localStorage.removeItem('token')
  route('/register')
}

export const handleResponse = ({ resp, valid }) => {
  if (valid.includes(resp.kind)) {
    return {
      data: resp.data
    }
  }
  return {
    error: resp.message
  }
}

export const request = (method, endpoint, data) => {
  let body = null
  let qs = ''
  if (method === 'GET' && data) {
    // encode data into the querystring
    // eslint-disable-next-line prefer-template
    qs = '?' + Object.keys(data)
      .filter(k => data[k] !== undefined)
      .map(k => `${k}=${encodeURIComponent(data[k])}`)
      .join('&')
  } else {
    body = data
  }
  const headers = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
  if (body) {
    headers['Content-Type'] = 'application/json'
  }
  return fetch(config.apiEndpoint + endpoint + qs, {
    method,
    headers,
    body: body && JSON.stringify(body)
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

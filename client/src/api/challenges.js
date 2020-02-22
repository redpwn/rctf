import { request } from './util'

export const getChallenges = () => {
  return request('GET', '/challs')
    .then(resp => resp.data)
}

export const getPrivateSolves = () => {
  return request('GET', '/users/me/solves')
    .then(resp => resp.data)
}

export const submitFlag = (id, flag) => {
  if (flag === undefined || flag.length === 0) {
    return Promise.resolve({
      error: "Flag can't be empty"
    })
  }

  return request('POST', `/challs/${encodeURIComponent(id)}/submit`, {
    flag
  })
    .then(resp => {
      switch (resp.kind) {
        case 'badFlag':
        case 'alreadySolved':
          return {
            error: resp.message
          }
        case 'goodFlag':
          return {
            error: undefined
          }
      }
    })
}

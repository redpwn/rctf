import { request } from './util'

export const getChallenges = async () => {
  return (await request('GET', '/challs')).data
}

export const getPrivateSolves = async () => {
  return (await request('GET', '/users/me')).data.solves
}

export const submitFlag = async (id, flag) => {
  if (flag === undefined || flag.length === 0) {
    return Promise.resolve({
      error: "Flag can't be empty"
    })
  }

  const resp = await request('POST', `/challs/${encodeURIComponent(id)}/submit`, {
    flag
  })
  switch (resp.kind) {
    case 'goodFlag':
      return {
        error: undefined
      }
    default:
      return {
        error: resp.message
      }
  }
}

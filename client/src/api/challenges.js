import { request, handleResponse } from './util'
import { privateProfile } from './profile'

export const getChallenges = async () => {
  const resp = await request('GET', '/challs')

  return handleResponse({ resp, valid: ['goodChallenges'] })
}

export const getPrivateSolves = async () => {
  const { data, error } = await privateProfile()

  if (error) {
    return { error }
  }
  return {
    data: data.solves
  }
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

  return handleResponse({ resp, valid: ['goodFlag'] })
}

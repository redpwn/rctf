import { request } from '../util'

export const getChallenges = async () => {
  return (await request('GET', '/admin/challs')).data
}

export const updateChallenge = async ({ id, data }) => {
  return (await request('PUT', `/admin/challs/${encodeURIComponent(id)}`, { data })).data
}

export const deleteChallenge = async ({ id }) => {
  return (await request('DELETE', `/admin/challs/${encodeURIComponent(id)}`)).data
}

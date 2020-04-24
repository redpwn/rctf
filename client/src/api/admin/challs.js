import { request } from '../util'

export const getChallenges = () => {
  return request('GET', '/admin/challs')
    .then(resp => resp.data)
}

export const updateChallenge = ({ id, data }) => {
  return request('PUT', `/admin/challs/${encodeURIComponent(id)}`, { data })
    .then(resp => resp.data)
}

export const deleteChallenge = ({ id }) => {
  return request('DELETE', `/admin/challs/${encodeURIComponent(id)}`)
    .then(resp => resp.data)
}

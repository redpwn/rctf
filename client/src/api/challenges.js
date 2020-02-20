import { request } from './util'

export const getChallenges = () => {
  return request('GET', '/challs')
    .then(resp => resp.data)
}

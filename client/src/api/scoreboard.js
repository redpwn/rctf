import { request } from './util'

export const getScoreboard = (limit = 100, offset = 0) => {
  return request('GET', `/leaderboard?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`)
    .then(resp => resp.data)
}

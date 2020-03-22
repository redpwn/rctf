import { request } from './util'

export const getScoreboard = ({
  division,
  limit,
  offset
}) => {
  limit = limit || 100
  offset = offset || 0
  return request('GET', '/leaderboard', {
    division, limit, offset
  })
    .then(resp => resp.data)
}

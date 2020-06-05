import { request } from './util'

export const getScoreboard = ({ division, limit = 100, offset = 0 }) => {
  return request('GET', '/leaderboard/now', {
    division,
    limit,
    offset
  })
}

export const getGraph = async ({ division }) => {
  return request('GET', '/leaderboard/graph', {
    division,
    limit: 10
  })
}

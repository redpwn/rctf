import { request } from './util'

export const getScoreboard = ({
  division,
  limit,
  offset
}) => {
  limit = limit || 100
  offset = offset || 0
  return request('GET', '/leaderboard/now', {
    division, limit, offset
  })
    .then(resp => resp.data)
}

export const getGraph = ({ division }) => {
  return request('GET', '/leaderboard/graph', {
    division,
    limit: 10
  })
    .then(resp => resp.data)
}

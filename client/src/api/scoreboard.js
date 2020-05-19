import { request } from './util'

export const getScoreboard = async ({
  division,
  limit,
  offset
}) => {
  limit = limit || 100
  offset = offset || 0
  return (await request('GET', '/leaderboard/now', {
    division, limit, offset
  })).data
}

export const getGraph = async ({ division }) => {
  return (await request('GET', '/leaderboard/graph', {
    division,
    limit: 10
  })).data
}

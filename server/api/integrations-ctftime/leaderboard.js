import { responses } from '../../responses'
import * as cache from '../../cache'
import * as challenges from '../../challenges'
import config from '../../../config/server'

export default {
  method: 'get',
  path: '/integrations/ctftime/leaderboard',
  requireAuth: false,
  handler: async () => {
    if (config.startTime > Date.now()) {
      return [responses.goodCtftimeLeaderboard, JSON.stringify({
        tasks: [],
        standings: []
      })]
    }
    const { leaderboard } = await cache.leaderboard.getRange({
      start: 0,
      end: config.leaderboard.maxLimit
    })
    const tasks = challenges.getCleanedChallenges().map(chall => chall.name)
    const standings = leaderboard.map((user, i) => ({
      pos: i + 1,
      team: user.name,
      score: user.score
    }))
    return [responses.goodCtftimeLeaderboard, JSON.stringify({
      tasks,
      standings
    })]
  }
}

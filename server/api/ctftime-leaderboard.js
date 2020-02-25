const { responses } = require('../responses')
const cache = require('../cache')
const challenges = require('../challenges')
const config = require('../../config/server')

module.exports = {
  method: 'get',
  path: '/integrations/ctftime/leaderboard',
  requireAuth: false,
  handler: async () => {
    const { leaderboard } = await cache.leaderboard.getRange({
      start: 0,
      end: config.leaderboardMaxLimit
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

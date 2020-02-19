const config = require('../../config')
const challenges = require('../challenges')
const { responses } = require('../responses')

module.exports = {
  method: 'get',
  path: '/challs/',
  requireAuth: true,
  handler: async () => {
    if (Date.now() < config.startTime) {
      return responses.badNotStarted
    }

    const all = challenges.getAllChallenges()

    return [responses.goodChallenges, all]
  }
}

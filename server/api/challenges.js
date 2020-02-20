const config = require('../../config')
const challenges = require('../challenges')
const { responses } = require('../responses')
const util = require('../util')

module.exports = {
  method: 'get',
  path: '/challs',
  requireAuth: true,
  handler: async () => {
    if (Date.now() < config.startTime) {
      return util.notStarted()
    }

    const cleaned = challenges.getCleanedChallenges()
    return [responses.goodChallenges, cleaned]
  }
}

const config = require('../../config')
const challenges = require('../challenges')
const { responses } = require('../responses')
const util = require('../util')

module.exports = {
  method: 'get',
  path: '/challs/',
  requireAuth: true,
  handler: async () => {
    if (Date.now() < config.startTime) {
      return util.notStarted()
    }

    const all = challenges.getAllChallenges()

    const cleaned = all.map(({ files, description, author, points, id, name }) => {
      return {
        files,
        description,
        author,
        points,
        id,
        name
      }
    })

    return [responses.goodChallenges, cleaned]
  }
}

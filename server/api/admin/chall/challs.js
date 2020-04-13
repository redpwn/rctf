const { responses } = require('../responses')
const challenges = require('../../../challenges')
const { Permissions } = require('./util')

module.exports = {
  method: 'get',
  path: '',
  perms: [Permissions.READ],
  handler: async () => {
    const challs = challenges.getAllChallenges()
    return [responses.goodChallenges, challs]
  }
}

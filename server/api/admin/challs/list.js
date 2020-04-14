const { responses } = require('../../../responses')
const challenges = require('../../../challenges')
const perms = require('../../../util/perms')

module.exports = {
  method: 'get',
  path: '/admin/challs',
  requireAuth: true,
  perms: perms.challsRead,
  handler: async () => {
    const challs = challenges.getAllChallenges()
    return [responses.goodChallenges, challs]
  }
}

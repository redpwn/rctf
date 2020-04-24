const { responses } = require('../../../responses')
const challenges = require('../../../challenges')
const perms = require('../../../util/perms')
const cache = require('../../../cache')

module.exports = {
  method: 'delete',
  path: '/admin/challs/:id',
  requireAuth: true,
  perms: perms.challsWrite,
  schema: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      },
      required: ['id']
    }
  },
  handler: async ({ req }) => {
    const chall = challenges.deleteChallenge(req.params.id)

    cache.leaderboard.setChallsDirty()

    return [responses.goodChallengeDelete, chall]
  }
}

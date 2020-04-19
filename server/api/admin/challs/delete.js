const { responses } = require('../../../responses')
const challenges = require('../../../challenges')
const perms = require('../../../util/perms')

module.exports = {
  method: 'delete',
  path: '/admin/challs/:id',
  requireAuth: true,
  perms: perms.challsRead,
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

    // TODO: Update leaderboard cache

    return [responses.goodChallengeDelete, chall]
  }
}

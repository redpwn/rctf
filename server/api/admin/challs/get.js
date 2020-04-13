const { responses } = require('../../../responses')
const challenges = require('../../../challenges')
const perms = require('../../../util/perms')

module.exports = {
  method: 'get',
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
    const chall = challenges.getChallenge(req.params.id)

    return [responses.goodChallenges, chall]
  }
}

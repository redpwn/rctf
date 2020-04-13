const { responses } = require('../responses')
const challenges = require('../../../challenges')
const { Permissions } = require('./util')

module.exports = {
  method: 'get',
  path: '/:id',
  perms: [Permissions.READ],
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

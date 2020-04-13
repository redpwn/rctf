const { responses } = require('../responses')
const challenges = require('../../../challenges')
const { Permissions } = require('./util')

module.exports = {
  method: 'put',
  path: '/:id',
  perms: [Permissions.WRITE],
  schema: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      properties: {
        data: {
          type: 'object'
        }
      }
    }
  },
  handler: async ({ req }) => {
    const chall = req.body.data

    // Ensure id is consistent
    chall.id = req.params.id

    challenges.updateChallenge(chall)

    return [responses.goodChallengeUpdate, chall]
  }
}

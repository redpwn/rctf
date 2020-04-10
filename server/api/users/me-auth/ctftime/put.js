const config = require('../../../../../config/server')
const { responses } = require('../../../../responses')
const database = require('../../../../database')
const auth = require('../../../../auth')

module.exports = {
  method: 'put',
  path: '/users/me/auth/ctftime',
  requireAuth: true,
  schema: {
    body: {
      type: 'object',
      properties: {
        ctftimeToken: {
          type: 'string'
        }
      },
      required: ['ctftimeToken']
    }
  },
  handler: async ({ req, user }) => {
    if (!config.ctftimeClientId) {
      return responses.badEndpoint
    }
    const ctftimeData = await auth.token.getData(auth.token.tokenKinds.ctftimeAuth, req.body.ctftimeToken)
    if (ctftimeData === null) {
      return responses.badCtftimeToken
    }
    const result = await database.auth.updateUser({
      id: user.id,
      ctftimeId: ctftimeData.ctftimeId
    })
    if (result === undefined) {
      return responses.badUnknownUser
    }
    return responses.goodCtftimeAuthSet
  }
}

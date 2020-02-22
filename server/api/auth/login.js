const database = require('../../database')
const auth = require('../../auth')
const { responses } = require('../../responses')

module.exports = {
  method: 'post',
  path: '/auth/login',
  requireAuth: false,
  schema: {
    body: {
      type: 'object',
      properties: {
        teamToken: {
          type: 'string'
        }
      },
      required: ['teamToken']
    }
  },
  handler: async ({ req }) => {
    const uuid = await auth.token.getData(auth.token.tokenKinds.team, req.body.teamToken)
    if (uuid === null) {
      return responses.badTokenVerification
    }
    const user = await database.auth.getUserById({ id: uuid })
    if (user === undefined) {
      return responses.badUnknownUser
    }
    const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
    return [responses.goodLogin, {
      authToken
    }]
  }
}

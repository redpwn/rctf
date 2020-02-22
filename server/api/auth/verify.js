const auth = require('../../auth')
const cache = require('../../cache')
const database = require('../../database')
const { responses } = require('../../responses')

module.exports = {
  method: 'post',
  path: '/auth/verify',
  requireAuth: false,
  schema: {
    body: {
      properties: {
        verifyToken: {
          type: 'string'
        }
      },
      required: ['verifyToken']
    }
  },
  handler: async ({ req }) => {
    const tokenData = await auth.token.getData(auth.token.tokenKinds.verify, req.body.verifyToken)
    if (tokenData === null) {
      return responses.badTokenVerification
    }
    const tokenUnused = await cache.login.useLogin({ id: tokenData.verifyId })
    if (!tokenUnused) {
      return responses.badTokenVerification
    }

    if (tokenData.register) {
      return auth.register.register({
        division: tokenData.division,
        email: tokenData.email,
        name: tokenData.name
      })
    } else {
      const user = await database.auth.getUserByIdAndEmail({
        id: tokenData.userId,
        email: tokenData.email
      })
      if (user === undefined) {
        return responses.badUnknownUser
      }

      const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, user.id)
      const teamToken = await auth.token.getToken(auth.token.tokenKinds.team, user.id)
      return [responses.goodVerify, {
        authToken,
        teamToken
      }]
    }
  }
}

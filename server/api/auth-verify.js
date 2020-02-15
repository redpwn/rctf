const uuidv4 = require('uuid/v4')
const auth = require('../auth')
const cache = require('../cache')
const database = require('../database')
const { responses } = require('../responses')

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
      return responses.badToken
    }
    const tokenUnused = await cache.login.useLogin({ id: tokenData.id })
    if (!tokenUnused) {
      return responses.badToken
    }
    let uuid
    if (tokenData.register) {
      try {
        uuid = uuidv4()
        await database.auth.makeUser({
          division: tokenData.division,
          email: tokenData.email,
          id: uuid,
          name: tokenData.name,
          perms: 0
        })
      } catch (e) {
        return responses.badKnownEmail
      }
    } else {
      const user = await database.auth.getUserByEmail({ email: tokenData.email })
      if (user === undefined) {
        return responses.badUnknownEmail
      }
      uuid = user.id
    }
    const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
    const teamToken = await auth.token.getToken(auth.token.tokenKinds.team, uuid)
    return [responses.goodVerify, {
      authToken,
      teamToken
    }]
  }
}

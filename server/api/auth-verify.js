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
    return module.exports.handleToken(req.body.verifyToken)
  },
  handleToken: async token => {
    const tokenData = await auth.token.getData(auth.token.tokenKinds.verify, token)
    if (tokenData === null) {
      return responses.badTokenVerification
    }
    const tokenUnused = await cache.login.useLogin({ id: tokenData.id })
    if (!tokenUnused) {
      return responses.badTokenVerification
    }
    let uuid
    const userByEmail = await database.auth.getUserByEmail({ email: tokenData.email })
    const userByName = await database.auth.getUserByName({ name: tokenData.name })
    if (tokenData.register) {
      // Attempting to register
      if (userByEmail !== undefined) {
        return responses.badKnownEmail
      }
      if (userByName !== undefined) {
        return responses.badKnownName
      }
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
        return responses.errorInternal
      }
    } else {
      // Attempting to get info
      if (userByEmail === undefined) {
        return responses.badUnknownEmail
      }
      if (userByName === undefined) {
        return responses.badUnknownName
      }
      if (userByEmail.name !== tokenData.name) {
        return responses.badEmailNameMatch
      }
      uuid = userByEmail.id
    }
    const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
    const teamToken = await auth.token.getToken(auth.token.tokenKinds.team, uuid)
    return [responses.goodVerify, {
      authToken,
      teamToken
    }]
  }
}

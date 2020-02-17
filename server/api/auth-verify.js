const uuidv4 = require('uuid/v4')
const auth = require('../auth')
const cache = require('../cache')
const database = require('../database')
const util = require('../util')
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

    const verification = util.auth.nameEmailVerification(tokenData.register, userByEmail, userByName)
    if (verification !== undefined) return verification

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
        return responses.errorInternal
      }
    } else {
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

const { v4: uuidv4 } = require('uuid')
const emailValidator = require('email-validator')
const config = require('../../../../../config/server')
const { responses } = require('../../../../responses')
const cache = require('../../../../cache')
const util = require('../../../../util')
const auth = require('../../../../auth')
const database = require('../../../../database')

module.exports = {
  method: 'put',
  path: '/users/me/auth/email',
  requireAuth: true,
  schema: {
    body: {
      type: 'object',
      properties: {
        email: {
          type: 'string'
        }
      },
      required: ['email']
    }
  },
  handler: async ({ req, user }) => {
    if (!config.verifyEmail) {
      return responses.badEndpoint
    }
    const email = util.normalize.normalizeEmail(req.body.email)
    if (!emailValidator.validate(email)) {
      return responses.badEmail
    }

    const checkUser = await database.auth.getUserByEmail({
      email
    })
    if (checkUser !== undefined) {
      return responses.badKnownEmail
    }

    const verifyUuid = uuidv4()
    await cache.login.makeLogin({ id: verifyUuid })
    const verifyToken = await auth.token.getToken(auth.token.tokenKinds.verify, {
      verifyId: verifyUuid,
      kind: 'update',
      userId: user.id,
      email
    })

    await util.email.sendVerification({
      email,
      kind: 'update',
      token: verifyToken
    })

    return responses.goodVerifySent
  }
}

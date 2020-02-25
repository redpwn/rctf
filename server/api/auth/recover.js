const uuidv4 = require('uuid/v4')
const emailValidator = require('email-validator')
const cache = require('../../cache')
const util = require('../../util')
const auth = require('../../auth')
const database = require('../../database')
const config = require('../../../config/server')
const { responses } = require('../../responses')

module.exports = {
  method: 'post',
  path: '/auth/recover',
  requireAuth: false,
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
  handler: async ({ req }) => {
    if (!config.verifyEmail) {
      return responses.badEndpoint
    }

    const email = util.normalize.normalizeEmail(req.body.email)
    if (!emailValidator.validate(email)) {
      return responses.badEmail
    }

    const user = await database.auth.getUserByEmail({ email })
    if (user === undefined) {
      return responses.badUnknownEmail
    }

    const verifyUuid = uuidv4()
    await cache.login.makeLogin({ id: verifyUuid })
    const verifyToken = await auth.token.getToken(auth.token.tokenKinds.verify, {
      verifyId: verifyUuid,
      register: false,
      userId: user.id,
      email
    })

    await util.email.sendVerification({
      email,
      kind: 'recover',
      token: verifyToken
    })

    return responses.goodVerifySent
  }
}

const { v4: uuidv4 } = require('uuid')
const emailValidator = require('email-validator')
const cache = require('../../cache')
const util = require('../../util')
const auth = require('../../auth')
const config = require('../../../config/server')
const { responses } = require('../../responses')

module.exports = {
  method: 'post',
  path: '/auth/register',
  requireAuth: false,
  schema: {
    body: {
      type: 'object',
      properties: {
        email: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        division: {
          type: 'number',
          enum: Object.values(config.divisions)
        }
      },
      required: ['email', 'name', 'division']
    }
  },
  handler: async ({ req }) => {
    const email = util.normalize.normalizeEmail(req.body.email)
    const name = util.normalize.normalizeName(req.body.name)
    if (!emailValidator.validate(email)) {
      return responses.badEmail
    }

    if (config.verifyEmail) {
      const conflictError = await util.auth.getRegisterConflict({ name, email })
      if (conflictError !== undefined) {
        return conflictError
      }

      const verifyUuid = uuidv4()
      await cache.login.makeLogin({ id: verifyUuid })
      const verifyToken = await auth.token.getToken(auth.token.tokenKinds.verify, {
        verifyId: verifyUuid,
        register: true,
        email,
        name,
        division: req.body.division
      })

      await util.email.sendVerification({
        email,
        kind: 'register',
        token: verifyToken
      })

      return responses.goodVerifySent
    } else {
      return auth.register.register({
        division: req.body.division,
        email,
        name
      })
    }
  }
}

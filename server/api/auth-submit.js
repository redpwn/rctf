const uuidv4 = require('uuid/v4')
const emailValidator = require('email-validator')
const cache = require('../cache')
const database = require('../database')
const util = require('../util')
const auth = require('../auth')
const config = require('../../config')
const { responses } = require('../responses')

module.exports = {
  method: 'post',
  path: '/auth/submit',
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
        eligible: {
          type: 'boolean'
        },
        register: {
          type: 'boolean'
        }
      },
      required: ['email', 'name', 'eligible', 'register']
    }
  },
  handler: async ({ req }) => {
    const email = req.body.email.trim().toLowerCase()
    if (!emailValidator.validate(email)) {
      return responses.badEmail
    }
    const user = await database.auth.getUserByEmail({ email })
    if (user === undefined && !req.body.register) {
      return responses.badUnknownEmail
    }
    if (user !== undefined && req.body.register) {
      return responses.badKnownEmail
    }
    let division
    if (req.body.eligible) {
      division = config.divisions.eligible
    } else {
      division = config.divisions.ineligible
    }
    const uuid = uuidv4()
    await cache.login.makeLogin({ id: uuid })
    const verifyToken = await auth.token.getToken(auth.token.tokenKinds.verify, {
      id: uuid,
      division,
      email,
      register: req.body.register
    })
    await util.email.sendVerification({
      email,
      token: verifyToken
    })
    return responses.goodVerifySent
  }
}

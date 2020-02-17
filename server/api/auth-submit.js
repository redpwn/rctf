const uuidv4 = require('uuid/v4')
const emailValidator = require('email-validator')
const cache = require('../cache')
const database = require('../database')
const util = require('../util')
const auth = require('../auth')
const verifyEndpoint = require('./auth-verify')
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
        division: {
          type: 'number',
          enum: Object.values(config.divisions)
        },
        register: {
          type: 'boolean'
        }
      },
      required: ['email', 'name', 'division', 'register']
    }
  },
  handler: async ({ req }) => {
    const email = req.body.email.trim().toLowerCase()
    const name = req.body.name
    if (!emailValidator.validate(email)) {
      return responses.badEmail
    }
    const userByEmail = await database.auth.getUserByEmail({ email })
    const userByName = await database.auth.getUserByName({ name })

    const verification = util.auth.nameEmailVerification(req.body.register, userByEmail, userByName)
    if (verification !== undefined) return verification

    const uuid = uuidv4()
    await cache.login.makeLogin({ id: uuid })
    const verifyToken = await auth.token.getToken(auth.token.tokenKinds.verify, {
      id: uuid,
      email,
      name: req.body.name,
      division: req.body.division,
      register: req.body.register
    })

    if (config.verifyEmail) {
      await util.email.sendVerification({
        email,
        token: verifyToken
      })
      return responses.goodVerifySent
    } else {
      // Pretend user sent token to verify endpoint
      return verifyEndpoint.handleToken(verifyToken)
    }
  }
}

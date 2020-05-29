import { v4 as uuidv4 } from 'uuid'
import emailValidator from 'email-validator'
import * as cache from '../../cache'
import * as util from '../../util'
import * as auth from '../../auth'
import config from '../../../config/server'
import { responses } from '../../responses'

export default {
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
        },
        ctftimeToken: {
          type: 'string'
        }
      },
      oneOf: [{
        required: ['email', 'name', 'division']
      }, {
        required: ['ctftimeToken', 'division']
      }]
    }
  },
  handler: async ({ req }) => {
    let email
    let reqName
    let ctftimeId
    if (req.body.ctftimeToken !== undefined) {
      const ctftimeData = await auth.token.getData(auth.token.tokenKinds.ctftimeAuth, req.body.ctftimeToken)
      if (ctftimeData === null) {
        return responses.badCtftimeToken
      }
      reqName = ctftimeData.name
      ctftimeId = ctftimeData.ctftimeId
    } else {
      email = util.normalize.normalizeEmail(req.body.email)
      if (!emailValidator.validate(email)) {
        return responses.badEmail
      }
    }

    if (req.body.name !== undefined) {
      reqName = req.body.name
    }
    const name = util.normalize.normalizeName(reqName)

    const nameRegex = /^[!-~][ -~]{0,62}[!-~]$/
    if (!nameRegex.test(name)) {
      return [responses.badNameFormat, 'Name should match ' + nameRegex.toString()]
    }

    if (!config.verifyEmail) {
      return auth.register.register({
        division: req.body.division,
        email,
        name,
        ctftimeId
      })
    }

    if (req.body.ctftimeToken !== undefined) {
      return auth.register.register({
        division: req.body.division,
        name,
        ctftimeId
      })
    }

    const verifyUuid = uuidv4()
    await cache.login.makeLogin({ id: verifyUuid })
    const verifyToken = await auth.token.getToken(auth.token.tokenKinds.verify, {
      verifyId: verifyUuid,
      kind: 'register',
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
  }
}

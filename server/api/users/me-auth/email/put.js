import { v4 as uuidv4 } from 'uuid'
import emailValidator from 'email-validator'
import config from '../../../../config/server'
import { responses } from '../../../../responses'
import * as cache from '../../../../cache'
import * as util from '../../../../util'
import * as auth from '../../../../auth'
import * as database from '../../../../database'
import { sendVerification } from '../../../../email'

const recaptchaEnabled = util.recaptcha.checkProtectedAction(util.recaptcha.RecaptchaProtectedActions.setEmail)

export default {
  method: 'PUT',
  path: '/users/me/auth/email',
  requireAuth: true,
  schema: {
    body: {
      type: 'object',
      properties: {
        email: {
          type: 'string'
        },
        recaptchaCode: {
          type: 'string'
        }
      },
      required: ['email', ...(recaptchaEnabled ? ['recaptchaCode'] : [])]
    }
  },
  handler: async ({ req, user }) => {
    if (recaptchaEnabled && !await util.recaptcha.verifyRecaptchaCode(req.body.recaptchaCode)) {
      return responses.badRecaptchaCode
    }

    const email = util.normalize.normalizeEmail(req.body.email)
    if (!emailValidator.validate(email)) {
      return responses.badEmail
    }

    if (config.email) {
      const checkUser = await database.users.getUserByEmail({
        email
      })
      if (checkUser !== undefined) {
        return responses.badKnownEmail
      }
      if (config.divisionACLs && !util.restrict.divisionAllowed(email, user.division)) {
        return responses.badEmailChangeDivision
      }
    } else {
      let result
      try {
        result = await database.users.updateUser({
          id: user.id,
          email
        })
      } catch (e) {
        if (e.constraint === 'users_email_key') {
          return responses.badKnownEmail
        }
        throw e
      }
      if (result === undefined) {
        return responses.badUnknownUser
      }
      return responses.goodEmailSet
    }

    const verifyUuid = uuidv4()
    await cache.login.makeLogin({ id: verifyUuid })
    const verifyToken = await auth.token.getToken(auth.token.tokenKinds.verify, {
      verifyId: verifyUuid,
      kind: 'update',
      userId: user.id,
      email,
      division: user.division
    })

    try {
      await sendVerification({
        email,
        kind: 'update',
        token: verifyToken
      })
    } catch (e) {
      throw new Error(e.message)
    }

    return responses.goodVerifySent
  }
}

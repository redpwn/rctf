import * as util from '../../util'
import * as auth from '../../auth'
import config from '../../config/server'
import { responses } from '../../responses'

const recaptchaEnabled = util.recaptcha.checkProtectedAction(util.recaptcha.RecaptchaProtectedActions.register)

export default {
  method: 'POST',
  path: '/auth/register',
  requireAuth: false,
  schema: {
    body: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        ionToken: {
          type: 'string'
        },
        recaptchaCode: {
          type: 'string'
        }
      },
      required: [...(recaptchaEnabled ? ['recaptchaCode'] : []), 'ionToken']
    }
  },
  handler: async ({ req }) => {
    if (recaptchaEnabled && !await util.recaptcha.verifyRecaptchaCode(req.body.recaptchaCode)) {
      return responses.badRecaptchaCode
    }

    const ionToken = await auth.token.getData(auth.token.tokenKinds.ionAuth, req.body.ionToken)
    if (ionToken === null) {
      return responses.badIonToken
    }
    const { name: ionName, email, ionId, ionData } = ionToken

    const name = req.body.name || ionName

    const division = config.divisionACLs
      ? util.restrict.allowedDivisions(email)[0]
      : (config.defaultDivision || Object.keys(config.divisions)[0])
    if (division === undefined) {
      return responses.badCompetitionNotAllowed
    }

    return auth.register.register({
      division,
      email,
      name,
      ionId,
      ionData
    })
  }
}

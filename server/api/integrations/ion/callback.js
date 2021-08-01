import got from 'got'
import { responses } from '../../../responses'
import * as auth from '../../../auth'
import config from '../../../config/server'

const tokenEndpoint = 'https://ion.tjhsst.edu/oauth/token'
const userEndpoint = 'https://ion.tjhsst.edu/api/profile'

export default {
  method: 'POST',
  path: '/integrations/ion/callback',
  requireAuth: false,
  schema: {
    body: {
      type: 'object',
      properties: {
        ionCode: {
          type: 'string'
        }
      },
      required: ['ionCode']
    }
  },
  handler: async ({ req }) => {
    if (!config.ion) {
      return responses.badEndpoint
    }
    let tokenBody
    try {
      ({ body: tokenBody } = await got({
        url: tokenEndpoint,
        method: 'POST',
        responseType: 'json',
        form: {
          client_id: config.ion.clientId,
          client_secret: config.ion.clientSecret,
          code: req.body.ionCode,
          grant_type: 'authorization_code'
        }
      }))
    } catch (e) {
      if (e instanceof got.HTTPError && e.response.statusCode === 401) {
        return responses.badIonCode
      }
      throw e
    }
    const { body: userBody } = await got({
      url: userEndpoint,
      responseType: 'json',
      headers: {
        authorization: `Bearer ${tokenBody.access_token}`
      }
    })
    if (userBody.id === undefined) {
      return responses.badIonCode
    }
    const token = await auth.token.getToken(auth.token.tokenKinds.ionAuth, {
      name: userBody.ion_username,
      email: userBody.tj_email,
      ionId: userBody.id,
      ionData: {
        displayName: userBody.display_name,
        grade: userBody.grade.number
      }
    })
    return [responses.goodIonToken, {
      ionToken: token,
      ionName: userBody.ion_username,
      ionId: userBody.id
    }]
  }
}

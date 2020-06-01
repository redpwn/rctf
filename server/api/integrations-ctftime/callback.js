import got from 'got'
import { responses } from '../../responses'
import * as auth from '../../auth'
import config from '../../../config/server'

const tokenEndpoint = 'https://oauth.ctftime.org/token'
const userEndpoint = 'https://oauth.ctftime.org/user'

export default {
  method: 'POST',
  path: '/integrations/ctftime/callback',
  requireAuth: false,
  schema: {
    body: {
      type: 'object',
      properties: {
        ctftimeCode: {
          type: 'string'
        }
      },
      required: ['ctftimeCode']
    }
  },
  handler: async ({ req }) => {
    if (!config.ctftimeClientId) {
      return responses.badEndpoint
    }
    let tokenRes
    try {
      tokenRes = await got({
        url: tokenEndpoint,
        method: 'POST',
        form: {
          client_id: config.ctftimeClientId,
          client_secret: config.ctftimeClientSecret,
          code: req.body.ctftimeCode
        }
      })
    } catch (e) {
      if (e instanceof got.HTTPError && e.response.statusCode === 401) {
        return responses.badCtftimeCode
      }
      throw e
    }
    const tokenBody = JSON.parse(tokenRes.body)
    const userRes = await got({
      url: userEndpoint,
      headers: {
        authorization: `Bearer ${tokenBody.access_token}`
      }
    })
    const userBody = JSON.parse(userRes.body)
    if (userBody.team === undefined) {
      return responses.badCtftimeCode
    }
    const token = await auth.token.getToken(auth.token.tokenKinds.ctftimeAuth, {
      name: userBody.team.name,
      ctftimeId: userBody.team.id
    })
    return [responses.goodCtftimeToken, {
      ctftimeToken: token,
      ctftimeName: userBody.team.name,
      ctftimeId: userBody.team.id
    }]
  }
}

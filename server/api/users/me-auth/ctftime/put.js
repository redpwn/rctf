import config from '../../../../config/server'
import { responses } from '../../../../responses'
import * as database from '../../../../database'
import * as auth from '../../../../auth'

export default {
  method: 'PUT',
  path: '/users/me/auth/ctftime',
  requireAuth: true,
  schema: {
    body: {
      type: 'object',
      properties: {
        ctftimeToken: {
          type: 'string'
        }
      },
      required: ['ctftimeToken']
    }
  },
  handler: async ({ req, user }) => {
    if (!config.ctftime) {
      return responses.badEndpoint
    }
    const ctftimeData = await auth.token.getData(auth.token.tokenKinds.ctftimeAuth, req.body.ctftimeToken)
    if (ctftimeData === null) {
      return responses.badCtftimeToken
    }
    let result
    try {
      result = await database.users.updateUser({
        id: user.id,
        ctftimeId: ctftimeData.ctftimeId
      })
    } catch (e) {
      if (e.constraint === 'users_ctftime_id_key') {
        return responses.badKnownCtftimeId
      }
      throw e
    }
    if (result === undefined) {
      return responses.badUnknownUser
    }
    return responses.goodCtftimeAuthSet
  }
}

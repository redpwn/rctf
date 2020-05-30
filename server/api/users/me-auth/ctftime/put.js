import config from '../../../../../config/server'
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
    if (!config.ctftimeClientId) {
      return responses.badEndpoint
    }
    const ctftimeData = await auth.token.getData(auth.token.tokenKinds.ctftimeAuth, req.body.ctftimeToken)
    if (ctftimeData === null) {
      return responses.badCtftimeToken
    }
    const result = await database.auth.updateUser({
      id: user.id,
      ctftimeId: ctftimeData.ctftimeId
    })
    if (result === undefined) {
      return responses.badUnknownUser
    }
    return responses.goodCtftimeAuthSet
  }
}

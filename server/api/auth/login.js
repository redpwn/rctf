import * as database from '../../database'
import * as auth from '../../auth'
import { responses } from '../../responses'
import { deepEquals } from '../../util'

export default {
  method: 'POST',
  path: '/auth/login',
  requireAuth: false,
  schema: {
    body: {
      type: 'object',
      properties: {
        teamToken: {
          type: 'string'
        },
        ionToken: {
          type: 'string'
        }
      },
      oneOf: [{
        required: ['teamToken']
      }, {
        required: ['ionToken']
      }]
    }
  },
  handler: async ({ req }) => {
    let user
    let ionData
    if (req.body.ionToken !== undefined) {
      const ionToken = await auth.token.getData(auth.token.tokenKinds.ionAuth, req.body.ionToken)
      if (ionToken === null) {
        return responses.badIonToken
      }
      let ionId
      ({ ionId, ionData } = ionToken)
      user = await database.users.getUserByIonId({ ionId })
    } else {
      const uuid = await auth.token.getData(auth.token.tokenKinds.team, req.body.teamToken)
      if (uuid === null) {
        return responses.badTokenVerification
      }
      user = await database.users.getUserById({ id: uuid })
    }
    if (user === undefined) {
      return responses.badUnknownUser
    }
    if (!deepEquals(ionData, user.ionData)) {
      await database.users.updateUser({ id: user.id, ionData })
    }
    const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, user.id)
    return [responses.goodLogin, {
      authToken
    }]
  }
}

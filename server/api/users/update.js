import { responses } from '../../responses'
import * as database from '../../database'
import config from '../../../config/server'
import * as timeouts from '../../cache/timeouts'

export default {
  method: 'patch',
  path: '/users/me',
  requireAuth: true,
  schema: {
    body: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        division: {
          type: 'number',
          enum: Object.values(config.divisions)
        }
      }
    }
  },
  handler: async ({ user, req }) => {
    const uuid = user.id
    const { name, division } = req.body

    const passRateLimit = await timeouts.checkRateLimit({
      type: timeouts.types.UPDATE_PROFILE,
      userid: uuid,
      duration: 10 * 60 * 1000,
      limit: 1
    })

    // Rate limit name changes only
    if (name !== undefined && !passRateLimit.ok) {
      return [responses.badRateLimit, {
        timeLeft: passRateLimit.timeLeft
      }]
    }

    const newUser = await database.auth.updateUser({
      id: uuid,
      name,
      division
    })

    return [responses.goodUserUpdate, {
      user: {
        name: newUser.name,
        email: newUser.email,
        division: Number.parseInt(newUser.division)
      }
    }]
  }
}

import { responses } from '../../responses'
import * as database from '../../database'
import config from '../../config/server'
import * as timeouts from '../../cache/timeouts'
import * as util from '../../util'
import { DivisionACLError } from '../../errors'

export default {
  method: 'PATCH',
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
          type: 'string',
          enum: Object.keys(config.divisions)
        }
      }
    }
  },
  handler: async ({ user, req }) => {
    if (Date.now() > config.endTime) {
      return responses.badEnded
    }

    const uuid = user.id
    const division = req.body.division || user.division
    let name

    if (req.body.name !== undefined) {
      name = util.normalize.normalizeName(req.body.name)
      if (!util.validate.validateName(name)) {
        return responses.badName
      }

      const passRateLimit = await timeouts.checkRateLimit({
        type: timeouts.types.UPDATE_PROFILE,
        userid: uuid,
        duration: 10 * 60 * 1000,
        limit: 1
      })

      // Rate limit name changes only
      if (!passRateLimit.ok) {
        return [responses.badRateLimit, {
          timeLeft: passRateLimit.timeLeft
        }]
      }
    }

    let newUser
    try {
      newUser = await database.users.updateUser({
        id: uuid,
        name,
        division,
        email: user.email
      })
    } catch (e) {
      if (e instanceof DivisionACLError) {
        return responses.badDivisionNotAllowed
      }
      if (e.constraint === 'users_name_key') {
        return responses.badKnownName
      }
      throw e
    }

    return [responses.goodUserUpdate, {
      user: {
        name: newUser.name,
        email: newUser.email,
        division: newUser.division
      }
    }]
  }
}

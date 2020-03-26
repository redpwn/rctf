const { responses } = require('../../responses')
const database = require('../../database')
const config = require('../../../config/server')
const timeouts = require('../../cache/timeouts')

module.exports = {
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

    if (!passRateLimit.ok) {
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

const { responses } = require('../../responses')
const database = require('../../database')
const config = require('../../../config')

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
  handler: async ({ uuid, req }) => {
    const { name, division } = req.body

    const user = await database.auth.updateUser({
      id: uuid,
      name,
      division
    })

    return [responses.goodUserUpdate, {
      user: {
        name: user.name,
        email: user.email,
        division: Number.parseInt(user.division)
      }
    }]
  }
}

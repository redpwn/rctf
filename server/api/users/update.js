const { responses } = require('../../responses')
const database = require('../../auth')
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
  handler: async ({ uuid, name, email, division }) => {
    await database.auth.updateUser({
      id: uuid,
      name,
      email,
      division
    })

    return responses.goodUserUpdate
  }
}

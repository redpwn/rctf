const { responses } = require('../../responses')
const { getGenericUserData } = require('./util')

module.exports = {
  method: 'get',
  path: '/users/:id',
  requireAuth: false,
  schema: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      },
      required: ['id']
    }
  },
  handler: async ({ req }) => {
    const userData = await getGenericUserData({
      id: req.params.id
    })

    if (userData === null) return responses.badUnknownUser

    return [responses.goodUserData, userData]
  }
}

const { responses } = require('../responses')

module.exports = {
  method: 'post',
  path: '/auth/login',
  requireAuth: true,
  schema: {
    body: {
      type: 'object',
      properties: {
        email: {
          type: 'string'
        },
        password: {
          type: 'string'
        }
      },
      required: ['email', 'password']
    }
  },
  handler: async ({ req, uuid }) => {
    return [responses.goodLogin, {
      uuid
    }]
  }
}

const { responses } = require('../responses')

module.exports = {
  method: 'post',
  path: '/auth/login',
  requireAuth: true,
  schema: {
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
  },
  handler: ({ req, uuid }) => {
    return [responses.goodLogin, {
      uuid
    }]
  }
}

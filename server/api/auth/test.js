const { responses } = require('../../responses')

module.exports = {
  method: 'get',
  path: '/auth/test',
  requireAuth: true,
  handler: async () => {
    return responses.goodToken
  }
}

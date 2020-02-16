const { responses } = require('../responses')
const cache = require('../cache')

module.exports = {
  method: 'get',
  path: '/leaderboard',
  requireAuth: false,
  schema: {
    query: {
      type: 'object',
      properties: {
        limit: {
          type: 'string'
        },
        offset: {
          type: 'string'
        }
      },
      required: ['limit', 'offset']
    }
  },
  handler: async ({ req }) => {
    const limit = parseInt(req.query.limit)
    const offset = parseInt(req.query.offset)
    if (limit < 0 || offset < 0) {
      return responses.badBody
    }
    const result = await cache.leaderboard.getRange({
      start: offset,
      end: offset + limit
    })
    return [responses.goodLeaderboard, result]
  }
}

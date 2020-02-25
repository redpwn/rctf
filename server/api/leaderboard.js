const { responses } = require('../responses')
const cache = require('../cache')
const config = require('../../config/server')

const stringDivisions = Object.values(config.divisions).map(String)

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
        },
        division: {
          type: 'string',
          enum: stringDivisions
        }
      },
      required: ['limit', 'offset']
    }
  },
  handler: async ({ req }) => {
    const limit = parseInt(req.query.limit)
    const offset = parseInt(req.query.offset)
    if (limit < 0 ||
      offset < 0 ||
      limit > config.leaderboardMaxLimit ||
      offset > config.leaderboardMaxOffset) {
      return responses.badBody
    }
    const result = await cache.leaderboard.getRange({
      start: offset,
      end: offset + limit,
      division: req.query.division
    })
    return [responses.goodLeaderboard, result]
  }
}

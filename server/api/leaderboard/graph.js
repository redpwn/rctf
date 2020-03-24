const { responses } = require('../../responses')
const cache = require('../../cache')
const config = require('../../../config/server')

const stringDivisions = Object.values(config.divisions).map(String)

module.exports = {
  method: 'get',
  path: '/leaderboard/graph',
  requireAuth: false,
  schema: {
    query: {
      type: 'object',
      properties: {
        division: {
          type: 'string',
          enum: stringDivisions
        }
      }
    }
  },
  handler: async ({ req }) => {
    let division
    if (req.query.division !== undefined) {
      division = parseInt(req.query.division)
    }
    const graph = await cache.leaderboard.getGraph({
      division
    })
    return [responses.goodLeaderboard, {
      graph
    }]
  }
}

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
        },
        limit: {
          type: 'string'
        }
      },
      required: ['limit']
    }
  },
  handler: async ({ req }) => {
    let division
    const limit = parseInt(req.query.limit)
    if (req.query.division !== undefined) {
      division = parseInt(req.query.division)
    }
    if (limit < 1 || limit > config.graphMaxTeams) {
      return responses.badBody
    }
    const graph = await cache.leaderboard.getGraph({
      division,
      maxTeams: limit
    })
    const reducedGraph = graph.map((user) => {
      const { points } = user
      const reducedPoints = []
      points.forEach((point, i) => {
        const prev = points[i - 1]
        const next = points[i + 1]
        if (prev && next && prev.score === point.score && next.score === point.score) {
          return
        }
        reducedPoints.push(point)
      })
      return {
        ...user,
        points: reducedPoints
      }
    })
    return [responses.goodLeaderboard, {
      graph: reducedGraph
    }]
  }
}

import { responses } from '../../responses'
import * as cache from '../../cache'
import config from '../../config/server'

export default {
  method: 'GET',
  path: '/leaderboard/graph',
  requireAuth: false,
  schema: {
    querystring: {
      type: 'object',
      properties: {
        division: {
          type: 'string',
          enum: Object.keys(config.divisions)
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: config.leaderboard.graphMaxTeams
        }
      },
      required: ['limit']
    }
  },
  handler: async ({ req }) => {
    if (Date.now() < config.startTime) {
      return responses.badNotStarted
    }

    const division = req.query.division
    const limit = req.query.limit
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

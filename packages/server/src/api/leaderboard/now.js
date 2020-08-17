import { responses } from '../../responses'
import * as cache from '../../cache'
import config from '../../config/server'

export default {
  method: 'GET',
  path: '/leaderboard/now',
  requireAuth: false,
  schema: {
    querystring: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 0,
          maximum: config.leaderboard.maxLimit
        },
        offset: {
          type: 'integer',
          minimum: 0,
          maximum: config.leaderboard.maxOffset
        },
        division: {
          type: 'string',
          enum: Object.keys(config.divisions)
        }
      },
      required: ['limit', 'offset']
    }
  },
  handler: async ({ req }) => {
    if (Date.now() < config.startTime) {
      return responses.badNotStarted
    }

    const limit = req.query.limit
    const offset = req.query.offset
    const result = await cache.leaderboard.getRange({
      start: offset,
      end: offset + limit,
      division: req.query.division
    })
    return [responses.goodLeaderboard, result]
  }
}

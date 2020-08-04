import * as db from '../../database'
import * as challenges from '../../challenges'
import { responses } from '../../responses'
import config from '../../config/server'

export default {
  method: 'GET',
  path: '/challs/:id/solves',
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
    },
    query: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: config.leaderboard.maxLimit
        },
        offset: {
          type: 'integer',
          minimum: 0,
          maximum: config.leaderboard.maxOffset
        }
      },
      required: ['limit', 'offset']
    }
  },
  handler: async ({ req }) => {
    if (Date.now() < config.startTime) {
      return responses.badNotStarted
    }
    const chall = challenges.getCleanedChallenge(req.params.id)
    if (!chall) {
      return responses.badChallenge
    }
    const solves = await db.solves.getSolvesByChallId({
      challengeid: req.params.id,
      limit: req.query.limit,
      offset: req.query.offset
    })
    return [responses.goodChallengeSolves, {
      solves: solves.map(solve => ({
        id: solve.id,
        createdAt: solve.createdat.getTime(),
        userId: solve.userid,
        userName: solve.name
      }))
    }]
  }
}

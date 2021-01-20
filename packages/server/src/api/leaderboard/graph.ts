import { leaderboardGraphGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'
import { getGraph } from '../../cache/leaderboard'
import config from '../../config/server'
import { ValueOf } from 'type-fest'

export default makeFastifyRoute(
  leaderboardGraphGet,
  async ({ req, res }) => {
    if (Date.now() < config.startTime) {
      return res.badNotStarted()
    }

    const division = req.query.division
    const limit = req.query.limit
    const graph = await getGraph({
      division,
      maxTeams: limit,
    })
    const reducedGraph = graph.map(user => {
      const { points } = user
      const reducedPoints = points.filter((point, i) => {
        const prev = points[i - 1] as ValueOf<typeof points, number> | undefined
        const next = points[i + 1] as ValueOf<typeof points, number> | undefined
        return !(
          prev &&
          next &&
          prev.score === point.score &&
          next.score === point.score
        )
      })
      return {
        ...user,
        points: reducedPoints,
      }
    })
    return res.goodLeaderboardGraph({
      graph: reducedGraph,
    })
  },
  {
    schema: {
      querystring: {
        properties: {
          division: {
            enum: Object.keys(config.divisions),
          },
          limit: {
            maximum: config.leaderboard.graphMaxTeams,
          },
        },
      },
    },
  }
)

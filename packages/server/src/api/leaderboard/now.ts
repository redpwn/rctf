import { leaderboardNowGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'
import { getRange } from '../../cache/leaderboard'
import config from '../../config/server'

export default makeFastifyRoute(leaderboardNowGet, async ({ req, res }) => {
  if (Date.now() < config.startTime) {
    return res.badNotStarted()
  }

  const limit = req.query.limit
  const offset = req.query.offset
  const result = await getRange({
    start: offset,
    end: offset + limit,
    division: req.query.division,
  })
  return res.goodLeaderboard(result)
})

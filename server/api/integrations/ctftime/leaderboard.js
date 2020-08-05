import { responses } from '../../../responses'
import perms from '../../../util/perms'
import * as cache from '../../../cache'

export default {
  method: 'GET',
  path: '/integrations/ctftime/leaderboard',
  requireAuth: true,
  perms: perms.leaderboardRead,
  handler: async () => {
    const { leaderboard } = await cache.leaderboard.getRange({ all: true })
    const standings = leaderboard.map((user, i) => ({
      pos: i + 1,
      team: user.name,
      score: user.score
    }))
    return [responses.goodCtftimeLeaderboard, JSON.stringify({ standings })]
  }
}

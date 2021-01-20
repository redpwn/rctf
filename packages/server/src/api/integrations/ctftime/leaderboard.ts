import { integrationsCtftimeLeaderboardGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import { getRange as leaderboardGetRange } from '../../../cache/leaderboard'

export default makeFastifyRoute(
  integrationsCtftimeLeaderboardGet,
  async ({ res }) => {
    const { leaderboard } = await leaderboardGetRange({ all: true })
    const standings = leaderboard.map((user, i) => ({
      pos: i + 1,
      team: user.name,
      score: user.score,
    }))
    return res.goodCtftimeLeaderboard({ standings })
  }
)

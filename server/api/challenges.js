import config from '../../config/server'
import * as challenges from '../challenges'
import { responses } from '../responses'
import * as util from '../util'
import { getChallengeScores } from '../cache/leaderboard'

export default {
  method: 'get',
  path: '/challs',
  requireAuth: true,
  handler: async () => {
    if (Date.now() < config.startTime) {
      return util.notStarted()
    }

    const cleaned = challenges.getCleanedChallenges()
    const scores = await getChallengeScores({
      ids: cleaned.map(chall => chall.id)
    })

    return [responses.goodChallenges, cleaned.map((chall, i) => ({
      ...chall,
      points: scores[i]
    }))]
  }
}

import config from '../../config/server'
import * as challenges from '../challenges'
import { responses } from '../responses'
import * as util from '../util'

export default {
  method: 'get',
  path: '/challs',
  requireAuth: true,
  handler: async () => {
    if (Date.now() < config.startTime) {
      return util.notStarted()
    }

    const cleaned = challenges.getCleanedChallenges()
    return [responses.goodChallenges, cleaned]
  }
}

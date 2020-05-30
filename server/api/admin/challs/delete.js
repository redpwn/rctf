import { responses } from '../../../responses'
import * as challenges from '../../../challenges'
import perms from '../../../util/perms'
import * as cache from '../../../cache'

export default {
  method: 'DELETE',
  path: '/admin/challs/:id',
  requireAuth: true,
  perms: perms.challsWrite,
  schema: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      },
      required: ['id']
    }
  },
  handler: async ({ req }) => {
    const chall = challenges.deleteChallenge(req.params.id)

    cache.leaderboard.setChallsDirty()

    return [responses.goodChallengeDelete, chall]
  }
}

import { responses } from '../../../responses'
import * as challenges from '../../../challenges'
import perms from '../../../util/perms'

export default {
  method: 'get',
  path: '/admin/challs/:id',
  requireAuth: true,
  perms: perms.challsRead,
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
    const chall = challenges.getChallenge(req.params.id)

    return [responses.goodChallenges, chall]
  }
}

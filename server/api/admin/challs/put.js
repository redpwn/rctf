import { responses } from '../../../responses'
import * as challenges from '../../../challenges'
import perms from '../../../util/perms'

export default {
  method: 'put',
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
    },
    body: {
      type: 'object',
      properties: {
        data: {
          type: 'object'
        }
      }
    }
  },
  handler: async ({ req }) => {
    const chall = req.body.data

    // Ensure id is consistent
    chall.id = req.params.id

    challenges.updateChallenge(chall)

    return [responses.goodChallengeUpdate, chall]
  }
}

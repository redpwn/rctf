import * as database from '../../../database'
import { responses } from '../../../responses'
import config from '../../../config/server'

export default {
  method: 'DELETE',
  path: '/users/me/members/:id',
  requireAuth: true,
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
  handler: async ({ req, user }) => {
    if (!config.userMembers) {
      return responses.badEndpoint
    }

    await database.members.removeMember({
      id: req.params.id,
      userid: user.id
    })

    return responses.goodMemberDelete
  }
}

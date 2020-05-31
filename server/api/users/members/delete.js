import * as database from '../../../database'
import { responses } from '../../../responses'

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
    const { id } = req.params

    await database.members.removeMember({
      id,
      userid: user.id
    })

    return responses.goodMemberDelete
  }
}

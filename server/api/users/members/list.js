import * as database from '../../../database'
import { responses } from '../../../responses'

export default {
  method: 'GET',
  path: '/users/me/members',
  requireAuth: true,
  handler: async ({ user }) => {
    const members = await database.members.getMembers({
      userid: user.id
    })

    return [responses.goodMemberData, members]
  }
}

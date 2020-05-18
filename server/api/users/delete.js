import { responses } from '../../responses'
import * as database from '../../database'

export default {
  method: 'delete',
  path: '/users/me',
  requireAuth: true,
  handler: async ({ user }) => {
    const uuid = user.id
    await database.auth.removeUserById({
      id: uuid
    })

    return responses.goodUserDelete
  }
}

import { responses } from '../../responses'
import { getGenericUserData } from './util'
import * as auth from '../../auth'

export default {
  method: 'get',
  path: '/users/me',
  requireAuth: true,
  handler: async ({ user }) => {
    const uuid = user.id
    const userData = await getGenericUserData({
      id: uuid
    })

    const teamToken = await auth.token.getToken(auth.token.tokenKinds.team, uuid)

    return [responses.goodUserData, {
      ...userData,
      teamToken,
      id: uuid,
      email: user.email
    }]
  }
}

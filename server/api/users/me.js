import { responses } from '../../responses'
import { getUserData } from './util'
import * as util from '../../util'
import * as auth from '../../auth'

export default {
  method: 'GET',
  path: '/users/me',
  requireAuth: true,
  handler: async ({ user }) => {
    const uuid = user.id
    const userData = await getUserData({ user })

    const teamToken = await auth.token.getToken(auth.token.tokenKinds.team, uuid)

    const allowedDivisions = util.restrict.allowedDivisions(user.email)

    const instancerToken = await auth.token.getToken(auth.token.tokenKinds.instancer, {
      teamId: uuid,
      email: user.email,
      name: user.name
    })

    return [responses.goodUserData, {
      ...userData,
      teamToken,
      instancerToken,
      allowedDivisions,
      id: uuid,
      email: user.email
    }]
  }
}

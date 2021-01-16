import { authLoginPost } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'
import { getUserById, getUserByCtftimeId } from '../../database/users'
import { getData, getToken, tokenKinds } from '../../auth/token'

export default makeFastifyRoute(
  authLoginPost,
  async ({ req: { body }, res }) => {
    let user
    if ('ctftimeToken' in body) {
      const ctftimeData = await getData(
        tokenKinds.ctftimeAuth,
        body.ctftimeToken
      )
      if (ctftimeData === null) {
        return res.badCtftimeToken()
      }
      user = await getUserByCtftimeId({
        ctftimeId: ctftimeData.ctftimeId,
      })
    } else {
      const uuid = await getData(tokenKinds.team, body.teamToken)
      if (uuid === null) {
        return res.badTokenVerification()
      }
      user = await getUserById({ id: uuid })
    }
    if (user === undefined) {
      return res.badUnknownUser()
    }
    const authToken = await getToken(tokenKinds.auth, user.id)
    return res.goodLogin({ authToken })
  }
)

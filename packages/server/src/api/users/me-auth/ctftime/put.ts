import { usersMeAuthCtftimePut } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../../helpers'
import config from '../../../../config/server'
import { updateUser } from '../../../../database/users'
import { getData, tokenKinds } from '../../../../auth/token'

export default makeFastifyRoute(
  usersMeAuthCtftimePut,
  async ({ req, user, res }) => {
    if (!config.ctftime) {
      return res.badEndpoint()
    }
    const ctftimeData = await getData(
      tokenKinds.ctftimeAuth,
      req.body.ctftimeToken
    )
    if (ctftimeData === null) {
      return res.badCtftimeToken()
    }
    let result
    try {
      result = await updateUser({
        id: user.id,
        ctftimeId: ctftimeData.ctftimeId,
      })
    } catch (e) {
      if (e instanceof Object) {
        const { constraint } = e as { constraint?: string }
        if (constraint === 'users_ctftime_id_key') {
          return res.badKnownCtftimeId()
        }
      }
      throw e
    }
    if (result === undefined) {
      return res.badUnknownUser()
    }
    return res.goodCtftimeAuthSet()
  }
)

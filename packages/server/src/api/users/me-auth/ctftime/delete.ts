import { usersMeAuthCtftimeDelete } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../../helpers'
import config from '../../../../config/server'
import { removeCtftimeId } from '../../../../database/users'

export default makeFastifyRoute(
  usersMeAuthCtftimeDelete,
  async ({ user, res }) => {
    if (!config.ctftime) {
      return res.badEndpoint()
    }
    let result
    try {
      result = await removeCtftimeId({ id: user.id })
    } catch (e) {
      if (e instanceof Object) {
        const { constraint } = e as { constraint?: string }
        if (constraint === 'require_email_or_ctftime_id') {
          return res.badZeroAuth()
        }
      }
      throw e
    }
    if (result === undefined) {
      return res.badCtftimeNoExists()
    }
    return res.goodCtftimeRemoved()
  }
)

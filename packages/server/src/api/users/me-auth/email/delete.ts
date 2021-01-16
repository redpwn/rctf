import { usersMeAuthEmailDelete } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../../helpers'
import config from '../../../../config/server'
import { removeEmail } from '../../../../database/users'

export default makeFastifyRoute(
  usersMeAuthEmailDelete,
  async ({ user, res }) => {
    if (!config.email) {
      return res.badEndpoint()
    }
    let result
    try {
      result = await removeEmail({ id: user.id })
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
      return res.badEmailNoExists()
    }
    return res.goodEmailRemoved()
  }
)

import config from '../../../../config/server'
import { responses } from '../../../../responses'
import * as database from '../../../../database'

export default {
  method: 'DELETE',
  path: '/users/me/auth/ctftime',
  requireAuth: true,
  handler: async ({ user }) => {
    if (!config.ctftime) {
      return responses.badEndpoint
    }
    let result
    try {
      result = await database.users.removeCtftimeId({ id: user.id })
    } catch (e) {
      if (e.constraint === 'require_email_or_ctftime_id') {
        return responses.badZeroAuth
      }
      throw e
    }
    if (result === undefined) {
      return responses.badCtftimeNoExists
    }
    return responses.goodCtftimeRemoved
  }
}

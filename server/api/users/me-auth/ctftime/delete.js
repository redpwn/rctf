const config = require('../../../../../config/server')
const { responses } = require('../../../../responses')
const database = require('../../../../database')

module.exports = {
  method: 'delete',
  path: '/users/me/auth/ctftime',
  requireAuth: true,
  handler: async ({ user }) => {
    if (!config.ctftimeClientId) {
      return responses.badEndpoint
    }
    let result
    try {
      result = await database.auth.removeCtftimeId({ id: user.id })
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

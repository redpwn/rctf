const { responses } = require('../../../../responses')
const database = require('../../../../database')

module.exports = {
  method: 'delete',
  path: '/users/me/auth/email',
  requireAuth: true,
  handler: async ({ user }) => {
    let result
    try {
      result = await database.auth.removeEmail({ id: user.id })
    } catch (e) {
      if (e.constraint === 'require_email_or_ctftime_id') {
        return responses.badZeroAuth
      }
      throw e
    }
    if (result === undefined) {
      return responses.badEmailNoExists
    }
    return responses.goodEmailRemoved
  }
}

const { responses } = require('../../responses')
const database = require('../../database')

module.exports = {
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

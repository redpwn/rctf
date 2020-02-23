const { responses } = require('../../responses')
const database = require('../../auth')

module.exports = {
  method: 'delete',
  path: '/users/me',
  requireAuth: true,
  handler: async ({ uuid }) => {
    await database.auth.removeUserById({
      id: uuid
    })

    await database.solves.removeSolvesByUserId({
      id: uuid
    })

    return responses.goodUserDelete
  }
}

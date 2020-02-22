const db = require('../../database')
const { responses } = require('../../responses')

module.exports = {
  method: 'get',
  path: '/users/me/solves',
  requireAuth: true,
  handler: async ({ uuid }) => {
    const userSolves = await db.solves.getSolvesByUserId({ userid: uuid })

    if (userSolves === null) return responses.badUserData

    const returnedSolves = []

    userSolves.forEach(solve => {
      returnedSolves.push({
        id: solve.challengeid
      })
    })

    return [responses.goodUserData, returnedSolves]
  }
}

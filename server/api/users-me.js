const db = require('../database')
const challenges = require('../challenges')
const { responses } = require('../responses')
const auth = require('../auth')

module.exports = {
  method: 'get',
  path: '/users/me',
  requireAuth: true,
  handler: async ({ uuid }) => {
    const user = await db.users.getUserByUserId({ userid: uuid })

    if (user === undefined) return responses.badUserData

    const solves = await db.solves.getSolvesByUserId({ userid: uuid })
    const teamToken = await auth.token.getToken(auth.token.tokenKinds.team, uuid)

    const returnedSolves = []

    solves.forEach(solve => {
      const chall = challenges.getChallenge(solve.challengeid)
      // TODO: Should return the challenge point value as well
      returnedSolves.push([chall.name])
    })

    return [responses.goodUserData, {
      name: user.name,
      division: user.division,
      teamToken: teamToken,
      returnedSolves
    }]
  }
}

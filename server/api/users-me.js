const db = require('../database')
const challenges = require('../challenges')
const { responses } = require('../responses')
const config = require('../../config')
const auth = require('../auth')
const cache = require('../cache')

const divisionMap = new Map()

for (const division of Object.entries(config.divisions)) {
  divisionMap.set(division[1], division[0])
}

module.exports = {
  method: 'get',
  path: '/users/me',
  requireAuth: true,
  handler: async ({ uuid }) => {
    const user = await db.users.getUserByUserId({ userid: uuid })

    if (user === undefined) return responses.badUserData

    const userSolves = await db.solves.getSolvesByUserId({ userid: uuid })
    const teamToken = await auth.token.getToken(auth.token.tokenKinds.team, uuid)
    const score = await cache.leaderboard.getScore({ id: uuid })
    const returnedScore = score === null ? 0 : score

    const solves = []

    userSolves.forEach(solve => {
      const chall = challenges.getCleanedChallenge(solve.challengeid)
      // TODO: Should return the challenge point value, currently hard coded
      solves.push([chall.category, chall.name, 450])
    })

    return [responses.goodUserData, {
      name: user.name,
      division: divisionMap.get(Number(user.division)),
      score: returnedScore,
      teamToken: teamToken,
      solves
    }]
  }
}

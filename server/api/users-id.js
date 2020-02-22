const db = require('../database')
const challenges = require('../challenges')
const { responses } = require('../responses')
const config = require('../../config')
const cache = require('../cache')

const divisionMap = new Map()

for (const division of Object.entries(config.divisions)) {
  divisionMap.set(division[1], division[0])
}

module.exports = {
  method: 'get',
  path: '/users/:id',
  requireAuth: false,
  schema: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      },
      required: ['id']
    }
  },
  handler: async ({ req }) => {
    const user = await db.users.getUserByUserId({ userid: req.params.id })

    if (user === undefined) return responses.badUserData

    const userSolves = await db.solves.getSolvesByUserId({ userid: req.params.id })
    const score = await cache.leaderboard.getScore({ id: req.params.id })
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
      solves
    }]
  }
}

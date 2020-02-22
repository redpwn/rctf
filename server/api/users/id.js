const db = require('../../database')
const challenges = require('../../challenges')
const { responses } = require('../../responses')
const config = require('../../../config')
const cache = require('../../cache')
const { getChallengeScore } = require('../../cache/leaderboard')

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

    for (const solve of userSolves) {
      const chall = challenges.getCleanedChallenge(solve.challengeid)
      solves.push({
        category: chall.category,
        name: chall.name,
        points: await getChallengeScore({
          id: chall.id
        })
      })
    }

    return [responses.goodUserData, {
      name: user.name,
      division: divisionMap.get(Number(user.division)),
      score: returnedScore,
      solves
    }]
  }
}

const db = require('../../database')
const challenges = require('../../challenges')
const cache = require('../../cache')
const { getChallengeScore } = require('../../cache/leaderboard')
const config = require('../../../config')

const divisionMap = new Map()

for (const division of Object.entries(config.divisions)) {
  divisionMap.set(division[1], division[0])
}

module.exports = {
  getGenericUserData: async ({ id }) => {
    const user = await db.users.getUserByUserId({ userid: id })

    if (user === undefined) return null

    const userSolves = await db.solves.getSolvesByUserId({ userid: id })
    const score = await cache.leaderboard.getScore({ id })
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

    return {
      name: user.name,
      division: divisionMap.get(Number(user.division)),
      score: returnedScore,
      solves
    }
  }
}

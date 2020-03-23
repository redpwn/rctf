const db = require('../../database')
const challenges = require('../../challenges')
const cache = require('../../cache')
const { getChallengeScores } = require('../../cache/leaderboard')
const config = require('../../../config/server')

const divisionMap = new Map()

for (const division of Object.entries(config.divisions)) {
  divisionMap.set(division[1], division[0])
}

module.exports = {
  getGenericUserData: async ({ id }) => {
    const user = await db.users.getUserByUserId({ userid: id })

    if (user === undefined) return null

    const userSolves = await db.solves.getSolvesByUserId({ userid: id })
    let score = await cache.leaderboard.getScore({ id })
    if (score === null) {
      score = {
        score: 0,
        globalPlace: null,
        divisionPlace: null
      }
    }

    const solves = []

    const challengeScores = await getChallengeScores({
      ids: userSolves.map((solve) => solve.challengeid)
    })

    userSolves.forEach((solve, i) => {
      const chall = challenges.getCleanedChallenge(solve.challengeid)
      solves.push({
        category: chall.category,
        name: chall.name,
        points: challengeScores[i]
      })
    })

    return {
      name: user.name,
      division: Number(user.division),
      score: score.score,
      globalPlace: score.globalPlace,
      divisionPlace: score.divisionPlace,
      solves
    }
  }
}

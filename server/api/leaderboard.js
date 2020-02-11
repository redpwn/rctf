const db = require('../database')

const { responses } = require('../responses')
const challenges = require('../challenges')
const { getScore } = require('../util/scores')

module.exports = {
  method: 'get',
  path: '/leaderboard',
  requireAuth: false,
  handler: async ({ req, uuid }) => {
    const solveAmount = {}
    const challengeValues = {}
    const userSolves = {}
    const userScores = []

    const solves = await db.solves.getSolves()
    const users = await db.users.getUsers()

    for (let i = 0; i < solves.length; i++) {
      // Accumulate in solveAmount
      if (!(solves[i].challengeid in solveAmount)) {
        solveAmount[solves[i].challengeid] = 1
      } else {
        solveAmount[solves[i].challengeid] += 1
      }
      // Store which challenges each user solved for later
      if (!(solves[i].userid in userSolves)) {
        userSolves[solves[i].userid] = [solves[i].challengeid]
      } else {
        userSolves[solves[i].userid].push(solves[i].challengeid)
      }
    }

    const allChallenges = challenges.getAllChallenges()

    for (let i = 0; i < allChallenges.length; i++) {
      const challenge = allChallenges[i]
      if (!(challenge.id in solveAmount)) {
        // There are currently no solves
        challengeValues[challenge.id] = getScore('dynamic', challenge.points.min, challenge.points.max, 0)
      } else {
        challengeValues[challenge.id] = getScore('dynamic', challenge.points.min, challenge.points.max, solveAmount[challenge.id])
      }
    }

    for (let i = 0; i < users.length; i++) {
      if (!(users[i].userid in userSolves)) {
        // The user has not solved anything
        userScores.push([users[i].name, 0])
      } else {
        let currScore = 0
        for (let j = 0; j < userSolves[users[i].userid].length; j++) {
          // Add the score for the specific solve loaded fr om the challengeValues array using ids
          currScore += challengeValues[userSolves[users[i].userid][j]]
        }
        userScores.push([users[i].name, currScore])
      }
    }

    const sortedUsers = userScores.sort((a, b) => b[1] - a[1])

    return [responses.goodLeaderboard, {
      sortedUsers
    }]
  }
}

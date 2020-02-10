const db = require('../database')

const { responses } = require('../responses')
const challenges = require('../challenges')
const { getScore } = require('../util/scores')

module.exports = {
  method: 'get',
  path: '/leaderboard',
  requireAuth: false,
  schema: {},
  handler: ({ req, uuid }) => {

    let solveAmount = {}
    let challengeValues = {}
    let userSolves = {}
    let userScores = []
    const solves = db.leaderboard.getSolves()
    const users = db.leaderboard.getUsers()

    for(let i = 0; i < solves.length; i++){
      // Accumulate in solveAmount
      if(solveAmount[!solves[i].challengeid]){
        solveAmount[solves[i].challengeid] = 1
      }else{
        solveAmount[solves[i].challengeid]++
      }
      // Store which challenges each user solved for later
      if(!userSolves[solves[i].userid]){
        userSolves[solves[i].userid] = [solves[i].challengeid]
      }else{
        userSolves[solves[i].userid].push(solves[i].challengeid)
      }
    }

    for(let i = 0; i < challenges.getAllChallenges().length; i++){
      const challenge = challenges.getAllChallenges()[i]
      if(!solveAmount[challenge.id]){
        // There are currently no solves
        challengeValues[challenge.id] = getScore('dynamic', challlenge.points.min, challenge.points.max, 0)
      }else{
        challengeValues[challenge.id] = getScore('dynamic', challlenge.points.min, challenge.points.max, solveAmount[challenge.id])
      }
    }

    for(let i = 0; i < users.length; i++){
      if(!userSovles[users[i].userid]){
        // The user has not solved anything
        userScores.push([users[i].username, 0])
      }else{
        let currScore = 0
        for(let j = 0; j < userSolves[users[i].userid]; j++){
          // Add the score for the specific solve loaded fr om the challengeValues array using ids
          currScore += challengeValues[userSolves[users[i].userid][j]]
        }
        userScores.push([users[i].username, currScore])
      }
    }

    const sortedUsers = userScores.sort((a, b) => b[1] - a[1])

    return [responses.goodLeaderboard, {
      sortedUsers
    }]
  }
}
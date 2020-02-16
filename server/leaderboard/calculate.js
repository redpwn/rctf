const { workerData, parentPort } = require('worker_threads')
const util = require('../util')

const { solves, users, allChallenges } = workerData

const solveAmount = new Map()
const challengeValues = new Map()
const userSolves = new Map()
const userLastSolves = new Map()
const userScores = []

for (let i = 0; i < solves.length; i++) {
  // Accumulate in solveAmount
  const challId = solves[i].challengeid
  const userId = solves[i].userid
  if (!(challId in solveAmount)) {
    solveAmount.set(challId, 1)
  } else {
    solveAmount.set(challId, solveAmount.get(challId) + 1)
  }
  // Store which challenges each user solved for later
  if (!(userId in userSolves)) {
    userSolves.set(userId, [challId])
    userLastSolves.set(userId, solves[i].createdat)
  } else {
    userSolves.get(solves[i].userid).push(challId)
  }
}

for (let i = 0; i < allChallenges.length; i++) {
  const challenge = allChallenges[i]
  if (!(challenge.id in solveAmount)) {
    // There are currently no solves
    challengeValues.set(challenge.id, util.scores.getScore('dynamic', challenge.points.min, challenge.points.max, 0))
  } else {
    challengeValues.set(challenge.id, util.scores.getScore('dynamic', challenge.points.min, challenge.points.max, solveAmount.get(challenge.id)))
  }
}

for (let i = 0; i < users.length; i++) {
  const userId = users[i].userid
  let currScore = 0
  const solvedChalls = userSolves.get(userId)
  for (let j = 0; j < solvedChalls.length; j++) {
    // Add the score for the specific solve loaded fr om the challengeValues array using ids
    currScore += challengeValues.get(solvedChalls[j])
  }
  userScores.push([userId, users[i].name, currScore, userLastSolves.get(userId)])
}

const sortedUsers = userScores.sort((a, b) => {
  const scoreCompare = b[2] - a[2]
  if (scoreCompare !== 0) {
    return scoreCompare
  }
  return a[3] - b[3]
}).map((user) => user.slice(0, 3))

parentPort.postMessage(sortedUsers)

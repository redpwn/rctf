const { workerData, parentPort } = require('worker_threads')
const utilScores = require('../util/scores')

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
  if (!userSolves.has(userId)) {
    userSolves.set(userId, [challId])
    userLastSolves.set(userId, solves[i].createdat)
  } else {
    userSolves.get(userId).push(challId)
  }
}

for (let i = 0; i < allChallenges.length; i++) {
  const challenge = allChallenges[i]
  if (!solveAmount.has(challenge.id)) {
    // There are currently no solves
    challengeValues.set(challenge.id, utilScores.getScore('dynamic', challenge.points.min, challenge.points.max, 0))
  } else {
    challengeValues.set(challenge.id, utilScores.getScore('dynamic', challenge.points.min, challenge.points.max, solveAmount.get(challenge.id)))
  }
}

for (let i = 0; i < users.length; i++) {
  const user = users[i]
  let currScore = 0
  const solvedChalls = userSolves.get(user.id)
  if (solvedChalls === undefined) continue // If the user has not solved any challenges, do not add to leaderboard
  for (let j = 0; j < solvedChalls.length; j++) {
    // Add the score for the specific solve loaded from the challengeValues array using ids
    currScore += challengeValues.get(solvedChalls[j])
  }
  userScores.push([user.id, user.name, parseInt(user.division), currScore, userLastSolves.get(user.id)])
}

const sortedUsers = userScores.sort((a, b) => {
  // sort the users by score
  // if two user's scores are the same, sort by last solve time
  const scoreCompare = b[3] - a[3]
  if (scoreCompare !== 0) {
    return scoreCompare
  }
  return a[4] - b[4]
}).map((user) => user.slice(0, 4))

const challengeScores = []
challengeValues.forEach((score, id) => [
  challengeScores.push(id, score)
])

parentPort.postMessage({
  leaderboard: sortedUsers,
  challengeScores
})

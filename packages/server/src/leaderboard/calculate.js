import { workerData, parentPort } from 'worker_threads'
import { getScore } from '../util/scores'
import { calcSamples } from './samples'
import config from '../config/server'

const {
  data: {
    solves,
    users,
    graphUpdate,
    allChallenges
  }
} = workerData

const solveAmount = new Map()
const challengeTiebreakEligibles = new Map()
for (let i = 0; i < allChallenges.length; i++) {
  const challenge = allChallenges[i]
  solveAmount.set(challenge.id, 0)
  challengeTiebreakEligibles.set(challenge.id, challenge.tiebreakEligible)
}
const userSolves = new Map()
const userLastSolves = new Map()
let lastIndex = 0

const calculateScores = (sample) => {
  const challengeValues = new Map()
  const userScores = []

  for (; lastIndex < solves.length; lastIndex++) {
    const challId = solves[lastIndex].challengeid
    const userId = solves[lastIndex].userid
    const createdAt = solves[lastIndex].createdat

    if (createdAt > sample) {
      break
    }

    const amt = solveAmount.get(challId)
    if (amt === undefined) {
      continue
    }
    solveAmount.set(challId, amt + 1)

    if (challengeTiebreakEligibles.get(challId) !== false) { // !== false because we default to true
      userLastSolves.set(userId, createdAt)
    }
    // Store which challenges each user solved for later
    if (!userSolves.has(userId)) {
      userSolves.set(userId, [challId])
    } else {
      userSolves.get(userId).push(challId)
    }
  }

  let maxSolveAmount = 0
  for (let i = 0; i < allChallenges.length; i++) {
    const amt = solveAmount.get(allChallenges[i].id)
    if (amt > maxSolveAmount) {
      maxSolveAmount = amt
    }
  }

  for (let i = 0; i < allChallenges.length; i++) {
    const challenge = allChallenges[i]
    challengeValues.set(challenge.id, getScore(
      challenge.points.min,
      challenge.points.max,
      maxSolveAmount,
      solveAmount.get(challenge.id)
    ))
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    let currScore = 0
    const lastSolve = userLastSolves.get(user.id)
    if (lastSolve === undefined) continue // If the user has not solved any challenges, do not add to leaderboard
    const solvedChalls = userSolves.get(user.id)
    for (let j = 0; j < solvedChalls.length; j++) {
      // Add the score for the specific solve loaded from the challengeValues array using ids
      const value = challengeValues.get(solvedChalls[j])
      if (value !== undefined) {
        currScore += value
      }
    }
    userScores.push([user.id, user.name, user.division, currScore, lastSolve])
  }

  return {
    challengeValues,
    userScores
  }
}

const userCompare = (a, b) => {
  // sort the users by score
  // if two user's scores are the same, sort by last solve time
  const scoreCompare = b[3] - a[3]
  if (scoreCompare !== 0) {
    return scoreCompare
  }
  return a[4] - b[4]
}

const leaderboardUpdate = Math.min(Date.now(), config.endTime)
const samples = calcSamples({
  start: Math.max(graphUpdate + 1, config.startTime),
  end: leaderboardUpdate
})

const graphLeaderboards = []
samples.forEach((sample) => {
  const { userScores } = calculateScores(sample)
  graphLeaderboards.push({
    sample,
    scores: userScores.map((score) => [score[0], score[3]])
  })
})

const { userScores, challengeValues } = calculateScores(leaderboardUpdate)
const sortedUsers = userScores.sort(userCompare).map((user) => user.slice(0, 4))

parentPort.postMessage({
  leaderboard: sortedUsers,
  graphLeaderboards,
  challengeValues,
  solveAmount,
  leaderboardUpdate
})

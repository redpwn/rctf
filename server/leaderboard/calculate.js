const { workerData, parentPort } = require('worker_threads')
const utilScores = require('../util/scores')
const { calcSamples, getPreviousSample } = require('./samples')

const {
  graph,
  start,
  end,
  lastUpdate,
  data: {
    solves,
    users,
    allChallenges
  }
} = workerData

const solveAmount = new Map()
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

    // Accumulate in solveAmount
    if (!(challId in solveAmount)) {
      solveAmount.set(challId, 1)
    } else {
      solveAmount.set(challId, solveAmount.get(challId) + 1)
    }

    userLastSolves.set(userId, createdAt)
    // Store which challenges each user solved for later
    if (!userSolves.has(userId)) {
      userSolves.set(userId, [challId])
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
      const value = challengeValues.get(solvedChalls[j])
      if (value !== undefined) {
        currScore += value
      }
    }
    userScores.push([user.id, user.name, parseInt(user.division), currScore, userLastSolves.get(user.id)])
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

if (graph) {
  const samples = calcSamples({ start, end })
  const output = []

  samples.forEach((sample) => {
    const { userScores } = calculateScores(sample)
    output.push({
      sample,
      scores: userScores.map((score) => [score[0], score[3]])
    })
  })

  parentPort.postMessage({
    leaderboards: output
  })
} else {
  let sample
  let isSample = false
  const prevSample = getPreviousSample()
  if (lastUpdate !== prevSample) {
    sample = prevSample
    isSample = true
  } else {
    sample = Date.now()
  }

  const { challengeValues, userScores } = calculateScores(sample)

  const sortedUsers = userScores.sort(userCompare).map((user) => user.slice(0, 4))

  const challengeScores = []
  challengeValues.forEach((score, id) => [
    challengeScores.push(id, score)
  ])

  let sampleScores
  if (isSample) {
    sampleScores = userScores.map((score) => [score[0], score[3]])
  }

  parentPort.postMessage({
    leaderboard: sortedUsers,
    challengeScores,
    isSample,
    sample,
    sampleScores
  })
}

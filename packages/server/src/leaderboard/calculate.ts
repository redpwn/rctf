import { workerData, parentPort } from 'worker_threads'
import { getScore } from '../util/scores'
import { WorkerRequest, WorkerResponse, ChallengeInfo, UserInfo, GraphEntry } from './types'

if (parentPort === null) {
  throw new Error('calculate must be run in a worker thread')
}

const {
  solves,
  users,
  graphUpdate,
  challenges,
  config
} = workerData as WorkerRequest

const challengeInfos = new Map<ChallengeInfo['id'], ChallengeInfo>()
for (let i = 0; i < challenges.length; i++) {
  const challenge = challenges[i]
  challengeInfos.set(challenge.id, {
    id: challenge.id,
    tiebreakEligible: challenge.tiebreakEligible,
    solves: 0,
    score: 0
  })
}
const userInfos = new Map<UserInfo['id'], UserInfo>()
for (let i = 0; i < users.length; i++) {
  const user = users[i]
  userInfos.set(user.id, {
    id: user.id,
    name: user.name,
    division: user.division,
    score: 0,
    lastSolve: 0,
    solvedChallengeIds: []
  })
}

const graphSampleTime = config.leaderboard.graphSampleTime
export const calcSamples = ({ start, end }: { start: number, end: number }): number[] => {
  const samples = []
  const sampleStart = Math.ceil(start / graphSampleTime) * graphSampleTime
  const sampleEnd = Math.floor(end / graphSampleTime) * graphSampleTime

  for (let sample = sampleStart; sample <= sampleEnd; sample += graphSampleTime) {
    samples.push(sample)
  }
  return samples
}

let lastIdx = 0
const calcScores = (sample: number): void => {
  for (; lastIdx < solves.length; lastIdx++) {
    const challId = solves[lastIdx].challengeid
    const userId = solves[lastIdx].userid
    const createdAt = solves[lastIdx].createdat.valueOf()

    if (createdAt > sample) {
      break
    }

    const challengeInfo = challengeInfos.get(challId)
    if (challengeInfo === undefined) {
      continue
    }
    const userInfo = userInfos.get(userId)
    if (userInfo === undefined) {
      continue
    }

    challengeInfo.solves++

    if (challengeInfo.tiebreakEligible) {
      userInfo.lastSolve = createdAt
    }

    userInfo.solvedChallengeIds.push(challId)
  }

  let maxSolves = 0
  for (const [, challengeInfo] of challengeInfos) {
    if (challengeInfo.solves > maxSolves) {
      maxSolves = challengeInfo.solves
    }
  }

  for (let i = 0; i < challenges.length; i++) {
    const challenge = challenges[i]
    const challengeInfo = challengeInfos.get(challenge.id) as ChallengeInfo
    challengeInfo.score = getScore(
      challenge.points.min,
      challenge.points.max,
      maxSolves,
      challengeInfo.solves
    )
  }

  for (const [, userInfo] of userInfos) {
    userInfo.score = 0
    for (let j = 0; j < userInfo.solvedChallengeIds.length; j++) {
      const challengeInfo = challengeInfos.get(userInfo.solvedChallengeIds[j])
      if (challengeInfo === undefined) {
        continue
      }
      userInfo.score += challengeInfo.score
    }
  }
}

const userCompare = (a: UserInfo, b: UserInfo) => {
  // sort the users by score
  // if two user's scores are the same, sort by last solve time
  const scoreCompare = b.score - a.score
  if (scoreCompare !== 0) {
    return scoreCompare
  }
  return a.lastSolve - b.lastSolve
}

const leaderboardUpdate = Math.min(Date.now(), config.endTime)
const samples = calcSamples({
  start: Math.max(graphUpdate + 1, config.startTime),
  end: leaderboardUpdate
})

const graphLeaderboards: GraphEntry[] = []
samples.forEach((sample) => {
  calcScores(sample)
  const graphUserInfos: GraphEntry['userInfos'] = []
  for (const [, userInfo] of userInfos) {
    graphUserInfos.push({
      id: userInfo.id,
      score: userInfo.score
    })
  }
  graphLeaderboards.push({
    sample,
    userInfos: graphUserInfos
  })
})

calcScores(leaderboardUpdate)
const leaderboard = Array.from(userInfos.values())
  .filter(userInfo => userInfo.lastSolve !== 0)
  .sort(userCompare)

parentPort.postMessage({
  leaderboard,
  graphLeaderboards,
  challengeInfos,
  leaderboardUpdate
} as WorkerResponse)

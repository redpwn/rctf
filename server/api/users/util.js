import * as db from '../../database'
import * as challenges from '../../challenges'
import * as cache from '../../cache'
import { getChallengeScores } from '../../cache/leaderboard'
import config from '../../../config/server'

const divisionMap = new Map()

for (const division of Object.entries(config.divisions)) {
  divisionMap.set(division[1], division[0])
}

export const getGenericUserData = async ({ id }) => {
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
      points: challengeScores[i],
      id: chall.id
    })
  })

  return {
    name: user.name,
    ctftimeId: user.ctftime_id,
    division: Number(user.division),
    score: score.score,
    globalPlace: score.globalPlace,
    divisionPlace: score.divisionPlace,
    solves
  }
}

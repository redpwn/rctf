import * as db from '../../database'
import * as challenges from '../../challenges'
import * as cache from '../../cache'
import { getChallengeInfo } from '../../cache/leaderboard'
import config from '../../../config/server'

const divisionMap = new Map()

for (const division of Object.entries(config.divisions)) {
  divisionMap.set(division[1], division[0])
}

export const getGenericUserData = async ({ id }) => {
  let [
    user,
    { userSolves, challengeInfo },
    score
  ] = await Promise.all([
    db.users.getUserByUserId({ userid: id }),
    (async () => {
      const userSolves = await db.solves.getSolvesByUserId({ userid: id })
      const challengeInfo = await getChallengeInfo({
        ids: userSolves.map((solve) => solve.challengeid)
      })
      return { userSolves, challengeInfo }
    })(),
    cache.leaderboard.getScore({ id })
  ])

  if (user === undefined) return null

  if (score === null) {
    score = {
      score: 0,
      globalPlace: null,
      divisionPlace: null
    }
  }

  const solves = []

  userSolves.forEach((solve, i) => {
    const chall = challenges.getCleanedChallenge(solve.challengeid)

    // Ignore challenges with invalid id, potentially deleted challs
    if (chall === undefined) return

    solves.push({
      category: chall.category,
      name: chall.name,
      points: challengeInfo[i].score,
      solves: challengeInfo[i].solves,
      id: chall.id,
      createdAt: solve.createdat.valueOf()
    })
  })

  return {
    name: user.name,
    ctftimeId: user.ctftime_id,
    division: user.division,
    score: score.score,
    globalPlace: score.globalPlace,
    divisionPlace: score.divisionPlace,
    solves
  }
}

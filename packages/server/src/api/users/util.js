import * as db from '../../database'
import * as challenges from '../../challenges'
import * as cache from '../../cache'
import { getChallengeInfo } from '../../cache/leaderboard'

export const getGenericUserData = async ({ id }) => {
  const user = await db.users.getUserById({ id })
  if (user === undefined) return null

  return getUserData({ user })
}

export const getUserData = async ({ user }) => {
  let [
    { userSolves, challengeInfo },
    score
  ] = await Promise.all([
    (async () => {
      const userSolves = await db.solves.getSolvesByUserId({ userid: user.id })
      const challengeInfo = await getChallengeInfo({
        ids: userSolves.map((solve) => solve.challengeid)
      })
      return { userSolves, challengeInfo }
    })(),
    cache.leaderboard.getScore({ id: user.id })
  ])

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

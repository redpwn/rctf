import { User, getUserById } from '../../database/users'
import { getSolvesByUserId } from '../../database/solves'
import { getCleanedChallenge } from '../../challenges'
import { CleanedChallenge } from '../../challenges/types'
import {
  getScore,
  getChallengeInfo,
  GetScoreResponse,
  GetChallengeInfoResponse,
} from '../../cache/leaderboard'

export type UserSolvesData = Pick<
  CleanedChallenge,
  'category' | 'name' | 'id'
> &
  Pick<GetChallengeInfoResponse[number], 'solves'> & {
    points: GetChallengeInfoResponse[number]['score']
    createdAt: number
  }

export type UserScoreData = Pick<NonNullable<GetScoreResponse>, 'score'> &
  {
    [K in 'globalPlace' | 'divisionPlace']:
      | NonNullable<GetScoreResponse>[K]
      | null
  }

export type UserData = Pick<User, 'name' | 'ctftimeId' | 'division'> &
  UserScoreData & {
    solves: UserSolvesData[]
  }

export const getGenericUserData = async ({
  id,
}: Pick<User, 'id'>): Promise<UserData | null> => {
  const user = await getUserById({ id })
  if (user === undefined) return null

  return getUserData({ user })
}

// TODO: lift into a util module
function removeNullish<T>(arr: T[]): NonNullable<T>[] {
  return arr.filter(e => e != null) as NonNullable<T>[]
}

export const getUserData = async ({
  user,
}: {
  user: User
}): Promise<UserData> => {
  const [{ userSolves, challengeInfo }, score] = await Promise.all([
    (async () => {
      const userSolves = await getSolvesByUserId({ userid: user.id })
      const challengeInfo = await getChallengeInfo({
        ids: userSolves.map(solve => solve.challengeid),
      })
      return { userSolves, challengeInfo }
    })(),
    getScore({ id: user.id }),
  ])

  const cleanedScore: {
    score: number
    globalPlace: number | null
    divisionPlace: number | null
  } = score ?? {
    score: 0,
    globalPlace: null,
    divisionPlace: null,
  }

  const solves = removeNullish(
    userSolves.map((solve, i) => {
      const chall = getCleanedChallenge(solve.challengeid)

      // Ignore challenges with invalid id, potentially deleted challs
      // eslint-disable-next-line array-callback-return
      if (chall === undefined) return

      return {
        category: chall.category,
        name: chall.name,
        points: challengeInfo[i].score,
        solves: challengeInfo[i].solves,
        id: chall.id,
        createdAt: solve.createdat.valueOf(),
      }
    })
  )

  return {
    name: user.name,
    ctftimeId: user.ctftimeId,
    division: user.division,
    score: cleanedScore.score,
    globalPlace: cleanedScore.globalPlace,
    divisionPlace: cleanedScore.divisionPlace,
    solves,
  }
}

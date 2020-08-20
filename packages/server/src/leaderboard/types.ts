import { Solve } from '../database/solves'
import { User } from '../database/users'
import { Challenge } from '../challenges/types'
import { ServerConfig } from '../config/types'

export type WorkerRequest = {
  solves: Solve[],
  users: Pick<User, 'id' | 'name' | 'division'>[],
  graphUpdate: number,
  challenges: Challenge[],
  config: ServerConfig
}

export type InternalUserInfo = Pick<User, 'id' | 'name' | 'division'> & {
  score: number,
  lastSolve: number,
  solvedChallengeIds: Challenge['id'][]
}

export type UserInfo = Pick<InternalUserInfo, 'id' | 'name' | 'score'>

export type InternalChallengeInfo = Pick<Challenge, 'id' | 'tiebreakEligible'> & {
  solves: number,
  score: number
}

export type ChallengeInfo = {
  solves: InternalChallengeInfo['solves'] | null,
  score: InternalChallengeInfo['score'] | null
}

export type InternalGraphEntry = {
  sample: number
  userInfos: Pick<InternalUserInfo, 'id' | 'score'>[]
}

export type GraphEntry = Pick<User, 'id' | 'name'> & {
  points: {
    time: number,
    score: number
  }[]
}

export type WorkerResponse = {
  leaderboard: InternalUserInfo[],
  graphLeaderboards: InternalGraphEntry[],
  challengeInfos: Map<InternalChallengeInfo['id'], InternalChallengeInfo>,
  leaderboardUpdate: number
}

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

export type UserInfo = Pick<User, 'id' | 'name' | 'division'> & {
  score: number,
  lastSolve: number,
  solvedChallengeIds: Challenge['id'][]
}

export type ExternalUserInfo = Pick<UserInfo, 'id' | 'name' | 'score'>

export type ChallengeInfo = Pick<Challenge, 'id' | 'tiebreakEligible'> & {
  solves: number,
  score: number
}

export type ExternalChallengeInfo = {
  solves: ChallengeInfo['solves'] | null,
  score: ChallengeInfo['score'] | null
}

export type GraphEntry = {
  sample: number
  userInfos: Pick<UserInfo, 'id' | 'score'>[]
}

export type ExternalGraphEntry = Pick<User, 'id' | 'name'> & {
  points: {
    time: number,
    score: number
  }[]
}

export type WorkerResponse = {
  leaderboard: UserInfo[],
  graphLeaderboards: GraphEntry[],
  challengeInfos: Map<ChallengeInfo['id'], ChallengeInfo>,
  leaderboardUpdate: number
}

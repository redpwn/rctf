import { Solve } from '../database/solves'
import { User } from '../database/users'
import { Challenge } from '../challenges/types'
import { ServerConfig } from '../config/types'

export interface WorkerRequest {
  solves: Solve[]
  users: Pick<User, 'id' | 'name' | 'division'>[]
  graphUpdate: number
  challenges: Challenge[]
  config: ServerConfig
}

export type InternalUserInfo = Pick<User, 'id' | 'name' | 'division'> & {
  score: number
  lastSolve: number | undefined
  lastTiebreakEligibleSolve: number | undefined
  solvedChallengeIds: Challenge['id'][]
}

export type UserInfo = Pick<InternalUserInfo, 'id' | 'name' | 'score'>

export type InternalChallengeInfo = Pick<
  Challenge,
  'id' | 'tiebreakEligible'
> & {
  solves: number
  score: number
}

export interface ChallengeInfo {
  solves: InternalChallengeInfo['solves'] | null
  score: InternalChallengeInfo['score'] | null
}

export interface InternalGraphEntry {
  sample: number
  userInfos: Pick<InternalUserInfo, 'id' | 'score'>[]
}

export type GraphEntry = Pick<User, 'id' | 'name'> & {
  points: {
    time: number
    score: number
  }[]
}

export interface WorkerResponse {
  leaderboard: InternalUserInfo[]
  graphLeaderboards: InternalGraphEntry[]
  challengeInfos: Map<InternalChallengeInfo['id'], InternalChallengeInfo>
  leaderboardUpdate: number
}

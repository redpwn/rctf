import { MergeExclusive } from 'type-fest'
import client, { loadScript } from './client'
import config from '../config/server'
import { User } from '../database/users'
import { Challenge } from '../challenges/types'
import { WorkerResponse, ExternalUserInfo, ExternalChallengeInfo, UserInfo, ExternalGraphEntry } from '../leaderboard/types'

client.defineCommand('rctfSetLeaderboard', {
  lua: loadScript('set-leaderboard')
})
export type scriptSetLeaderboard = (keys: number, ...args: string[]) => Promise<void>

const getLeaderboardKey = (division?: string): string => {
  if (division === undefined) {
    return 'global-leaderboard'
  } else {
    return 'division-leaderboard:' + division
  }
}

export const setLeaderboard = async ({
  leaderboard,
  challengeInfos,
  leaderboardUpdate
}: Pick<WorkerResponse, 'leaderboard' | 'challengeInfos' | 'leaderboardUpdate'>): Promise<void> => {
  const divisions = Object.keys(config.divisions)
  const divisionKeys = divisions.map(getLeaderboardKey)
  const keys = [
    'score-positions',
    'challenge-info',
    'global-leaderboard',
    'leaderboard-update',
    ...divisionKeys
  ]
  const wireChallengeInfos: string[] = []
  for (const [, challengeInfo] of challengeInfos) {
    wireChallengeInfos.push(challengeInfo.id, `${challengeInfo.score},${challengeInfo.solves}`)
  }
  const wireLeaderboard: string[] = []
  for (let i = 0; i < leaderboard.length; i++) {
    const userInfo = leaderboard[i]
    wireLeaderboard.push(userInfo.id, userInfo.name, userInfo.division, userInfo.score.toString())
  }
  await client.rctfSetLeaderboard(
    keys.length,
    ...keys,
    JSON.stringify(wireLeaderboard),
    JSON.stringify(divisions),
    JSON.stringify(wireChallengeInfos),
    leaderboardUpdate.toString()
  )
}

client.defineCommand('rctfGetRange', {
  numberOfKeys: 1,
  lua: loadScript('get-range')
})
export type scriptGetRange = (leaderbardKey: string, start: number, end: number) => Promise<string[]>

export const getRange = async ({
  start,
  end,
  division,
  all
}: {
  division: string
} & MergeExclusive<{
  start: number,
  end: number
}, {
  all: boolean
}>): Promise<{ total: number, leaderboard: ExternalUserInfo[] }> => {
  if (!all && start === end) {
    // zero-length query - get total only
    return {
      total: await client.llen(getLeaderboardKey(division)) / 3,
      leaderboard: []
    }
  }
  const redisResult = await client.rctfGetRange(
    getLeaderboardKey(division),
    all ? 0 : (start as number) * 3,
    all ? -1 : (end as number) * 3 - 1
  )
  const result = []
  for (let i = 0; i < redisResult.length - 1; i += 3) {
    // format the flat redis list response into an array of arrays
    // i is the user id, i + 1 is the user name, i + 2 is the user score
    result.push({
      id: redisResult[i],
      name: redisResult[i + 1],
      score: parseInt(redisResult[i + 2])
    })
  }
  return {
    total: parseInt(redisResult[redisResult.length - 1]) / 3,
    leaderboard: result
  }
}

export const getScore = async ({
  id
}: Pick<User, 'id'>): Promise<null | { score: UserInfo['score'], globalPlace: number, divisionPlace: number }> => {
  const redisResult = await client.hget('score-positions', id)
  if (redisResult === null) {
    return null
  }
  const split = redisResult.split(',')
  return {
    score: parseInt(split[0]),
    globalPlace: parseInt(split[1]),
    divisionPlace: parseInt(split[2])
  }
}

export const getChallengeInfo = async ({ ids }: { ids: Challenge['id'][] }): Promise<ExternalChallengeInfo[]> => {
  if (ids.length === 0) {
    return []
  }
  const redisResult = await client.hmget('challenge-info', ...ids)
  return redisResult.map((info) => {
    if (info === null) {
      return {
        score: null,
        solves: null
      }
    }
    const split = info.split(',')
    return {
      score: parseInt(split[0]),
      solves: parseInt(split[1])
    }
  })
}

client.defineCommand('rctfSetGraph', {
  lua: loadScript('set-graph')
})
export type scriptSetGraph = (keys: number, args: string[]) => Promise<void>

export const setGraph = async ({ graphLeaderboards }: Pick<WorkerResponse, 'graphLeaderboards'>): Promise<void> => {
  let lastSample = 0
  const userPoints = new Map<string, number[]>()
  for (let entryIdx = 0; entryIdx < graphLeaderboards.length; entryIdx++) {
    const graphEntry = graphLeaderboards[entryIdx]
    if (graphEntry.sample > lastSample) {
      lastSample = graphEntry.sample
    }
    for (let userIdx = 0; userIdx < graphEntry.userInfos.length; userIdx++) {
      const userInfo = graphEntry.userInfos[userIdx]
      const key = `graph:${userInfo.id}`
      const userPoint = userPoints.get(key)
      if (userPoint === undefined) {
        userPoints.set(key, [graphEntry.sample, userInfo.score])
      } else {
        userPoint.push(graphEntry.sample, userInfo.score)
      }
    }
  }
  if (userPoints.size === 0) {
    return
  }
  const keys = Array.from(userPoints.keys())
  const values = Array.from(userPoints.values())
  await client.rctfSetGraph(1 + keys.length, [
    'graph-update',
    ...keys,
    lastSample.toString(),
    JSON.stringify(values)
  ])
}

client.defineCommand('rctfGetGraph', {
  numberOfKeys: 2,
  lua: loadScript('get-graph')
})
export type scriptGetGraph = (leaderboardKey: string, leaderboardUpdateKey: string, maxTeams: string) => Promise<string | null>

export const getGraph = async ({
  division,
  maxTeams
}: { division: string, maxTeams: number }): Promise<ExternalGraphEntry[]> => {
  const redisResult = await client.rctfGetGraph(
    getLeaderboardKey(division),
    'leaderboard-update',
    maxTeams.toString()
  )
  if (redisResult === null) {
    return []
  }
  const parsed = JSON.parse(redisResult) as string[]
  const lastUpdate = parseInt(parsed[0])
  const latest = parsed[1]
  const graphData = parsed[2]
  const result = []
  for (let userIdx = 0; userIdx < latest.length / 3; userIdx++) {
    const points = [{
      time: lastUpdate,
      score: parseInt(latest[userIdx * 3 + 2])
    }]
    const userPoints = graphData[userIdx]
    for (let pointIdx = 0; pointIdx < userPoints.length; pointIdx += 2) {
      points.push({
        time: parseInt(userPoints[pointIdx]),
        score: parseInt(userPoints[pointIdx + 1])
      })
    }
    points.sort((a, b) => b.time - a.time)
    result.push({
      id: latest[userIdx * 3],
      name: latest[userIdx * 3 + 1],
      points
    })
  }
  return result
}

export const getGraphUpdate = async (): Promise<number> => {
  const redisResult = await client.get('graph-update')
  return redisResult === null ? 0 : parseInt(redisResult)
}

export const setChallsDirty = async (): Promise<void> => {
  await client.set('graph-update', 0)
}

import { promisify } from 'util'
import client from './client'
import config from '../config/server'

const redisEvalsha = promisify(client.evalsha.bind(client))
const redisHget = promisify(client.hget.bind(client))
const redisHmget = promisify(client.hmget.bind(client))
const redisGet = promisify(client.get.bind(client))
const redisSet = promisify(client.set.bind(client))
const redisLlen = promisify(client.llen.bind(client))
const redisScript = promisify(client.script.bind(client))

// The max number of arguments to a lua function is 7999. The cmd and key must be included with every redis call.
// Because hashes are specified as a value after a key, the chunk size must also be even.
// Therefore, the chunk size is set at 7996.
const luaChunkCall = `
  local function chunkCall(cmd, key, args)
    local size = 7996
    local len = #args
    local chunks = math.ceil(len / size)
    for i = 1, chunks do
      local start = (i - 1) * size + 1
      local stop = math.min(len, i * size)
      redis.call(cmd, key, unpack(args, start, stop))
    end
  end
`

const setLeaderboardScript = redisScript('load', `
  ${luaChunkCall}

  local leaderboard = cjson.decode(ARGV[1])
  local divisions = cjson.decode(ARGV[2])
  local challengeInfo = cjson.decode(ARGV[3])

  local divisionBoards = {}
  local divisionCounts = {}
  local globalBoard = {}
  local positionKeys = {}

  for _, division in ipairs(divisions) do
    divisionBoards[division] = {}
    divisionCounts[division] = 0
  end

  local numUsers = #leaderboard / 4
  for i = 1, numUsers do
    local division = leaderboard[i * 4 - 1]
    local divisionPosition = divisionCounts[division] + 1
    local divisionBoard = divisionBoards[division]

    divisionCounts[division] = divisionPosition
    divisionBoard[divisionPosition * 3] = leaderboard[i * 4]
    divisionBoard[divisionPosition * 3 - 1] = leaderboard[i * 4 - 2]
    divisionBoard[divisionPosition * 3 - 2] = leaderboard[i * 4 - 3]

    globalBoard[i * 3] = leaderboard[i * 4]
    globalBoard[i * 3 - 1] = leaderboard[i * 4 - 2]
    globalBoard[i * 3 - 2] = leaderboard[i * 4 - 3]

    positionKeys[i * 2] = leaderboard[i * 4] .. "," .. i .. "," .. divisionPosition
    positionKeys[i * 2 - 1] = leaderboard[i * 4 - 3]
  end

  redis.call("DEL", unpack(KEYS))
  if #challengeInfo ~= 0 then
    chunkCall("HSET", KEYS[2], challengeInfo)
  end
  if numUsers ~= 0 then
    chunkCall("HSET", KEYS[1], positionKeys)
    chunkCall("RPUSH", KEYS[3], globalBoard)
    redis.call("SET", KEYS[4], ARGV[4])
    for i, division in ipairs(divisions) do
      local divisionBoard = divisionBoards[division]
      if #divisionBoard ~= 0 then
        chunkCall("RPUSH", KEYS[i + 4], divisionBoard)
      end
    end
  end
`)

const getRangeScript = redisScript('load', `
  local result = redis.call("LRANGE", KEYS[1], ARGV[1], ARGV[2])
  result[#result + 1] = redis.call("LLEN", KEYS[1])
  return result
`)

// this script is not compatible with redis cluster as it computes key names at runtime
const getGraphScript = redisScript('load', `
  local maxUsers = tonumber(ARGV[1])
  local latest = redis.call("LRANGE", KEYS[1], 0, maxUsers * 3 - 1)
  if #latest == 0 then
    return nil
  end
  local users = {}
  for i = 1, maxUsers do
    local id = latest[i * 3 - 2]
    if id ~= nil then
      users[i] = redis.call("HGETALL", "graph:"..id)
    end
  end
  local lastUpdate = redis.call("GET", KEYS[2])
  return cjson.encode({
    lastUpdate,
    latest,
    users
  })
`)

const setGraphScript = redisScript('load', `
  ${luaChunkCall}

  redis.call("SET", KEYS[1], ARGV[1])
  local users = cjson.decode(ARGV[2])
  for i = 1, #users do
    chunkCall("HSET", KEYS[i + 1], users[i])
  end
`)

export const setLeaderboard = async ({ challengeValues, solveAmount, leaderboard, leaderboardUpdate }) => {
  const divisions = Object.keys(config.divisions)
  const divisionKeys = divisions.map(getLeaderboardKey)
  const keys = [
    'score-positions',
    'challenge-info',
    'global-leaderboard',
    'leaderboard-update',
    ...divisionKeys
  ]
  const challengeInfo = []
  challengeValues.forEach((value, key) => {
    challengeInfo.push(key, `${value},${solveAmount.get(key)}`)
  })
  await redisEvalsha(
    await setLeaderboardScript,
    keys.length,
    ...keys,
    JSON.stringify(leaderboard.flat()),
    JSON.stringify(divisions),
    JSON.stringify(challengeInfo),
    leaderboardUpdate
  )
}

const getLeaderboardKey = (division) => {
  if (division === undefined) {
    return 'global-leaderboard'
  } else {
    return 'division-leaderboard:' + division
  }
}

export const getRange = async ({ start, end, division, all }) => {
  if (all && (start !== undefined || end !== undefined)) {
    throw new Error('cannot specify all and either start or end')
  }
  if (!all && start === end) {
    // zero-length query - get total only
    return {
      total: await redisLlen(getLeaderboardKey(division)) / 3,
      leaderboard: []
    }
  }
  const redisResult = await redisEvalsha(
    await getRangeScript,
    1,
    getLeaderboardKey(division),
    all ? 0 : start * 3,
    all ? -1 : end * 3 - 1
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
    total: redisResult[redisResult.length - 1] / 3,
    leaderboard: result
  }
}

export const getScore = async ({ id }) => {
  const redisResult = await redisHget('score-positions', id)
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

export const getChallengeInfo = async ({ ids }) => {
  if (ids.length === 0) {
    return []
  }
  const redisResult = await redisHmget('challenge-info', ...ids)
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

export const setGraph = async ({ leaderboards }) => {
  let lastSample = 0
  const users = new Map()
  leaderboards.forEach(({ sample, scores }) => {
    if (sample > lastSample) {
      lastSample = sample
    }
    scores.forEach((score) => {
      const key = `graph:${score[0]}`
      if (users.has(key)) {
        users.get(key).push(sample, score[1])
      } else {
        users.set(key, [sample, score[1]])
      }
    })
  })
  if (users.size === 0) {
    return
  }
  const keys = Array.from(users.keys())
  const values = Array.from(users.values())
  await redisEvalsha([
    await setGraphScript,
    1 + keys.length,
    'graph-update',
    ...keys,
    lastSample,
    JSON.stringify(values)
  ])
}

export const getGraph = async ({ division, maxTeams }) => {
  const redisResult = await redisEvalsha(
    await getGraphScript,
    2,
    getLeaderboardKey(division),
    'leaderboard-update',
    maxTeams
  )
  if (redisResult === null) {
    return []
  }
  const parsed = JSON.parse(redisResult)
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

export const getGraphUpdate = async () => {
  const redisResult = await redisGet('graph-update')
  return redisResult === null ? 0 : parseInt(redisResult)
}

export const setChallsDirty = () => {
  return redisSet('graph-update', 0)
}

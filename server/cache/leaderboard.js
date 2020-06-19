import { promisify } from 'util'
import client from './client'
import config from '../../config/server'
import { calcSamples } from '../leaderboard/samples'

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
    local output = {}
    for i = 1, chunks, 1 do
      local start = (i - 1) * size + 1
      local stop = math.min(len, i * size)
      output[i] = redis.call(cmd, key, unpack(args, start, stop))
    end
    return output
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
  for i = 1, numUsers, 1 do
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

const getGraphScript = redisScript('load', `
  ${luaChunkCall}

  local maxUsers = tonumber(ARGV[1])
  local samples = cjson.decode(ARGV[2])
  local samplesLen = #samples
  local latest = redis.call("LRANGE", KEYS[1], 0, maxUsers * 3 - 1)
  if #latest == 0 then
    return nil
  end
  local graphKeys = {}
  for i = 1, maxUsers, 1 do
    local id = latest[i * 3 - 2]
    if id == nil then
      break
    end
    for s = 1, samplesLen, 1 do
      graphKeys[(i - 1) * samplesLen + s] = samples[s] .. ":" .. id
    end
  end
  local lastUpdate = redis.call("GET", KEYS[2])
  local graphPoints = chunkCall("HMGET", KEYS[3], graphKeys)
  return cjson.encode({
    lastUpdate,
    latest,
    graphPoints
  })
`)

const setGraphScript = redisScript('load', `
  ${luaChunkCall}

  chunkCall("HSET", KEYS[1], cjson.decode(ARGV[1]))
  redis.call("SET", KEYS[2], ARGV[2])
`)

export const setLeaderboard = async ({ challengeValues, solveAmount, leaderboard, leaderboardUpdate }) => {
  const divisions = Object.values(config.divisions)
  const divisionKeys = divisions.map((division) => 'division-leaderboard:' + division)
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

export const getRange = async ({ start, end, division }) => {
  if (start === end) {
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
    start * 3,
    end * 3 - 1
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
  const values = []
  let lastSample = 0
  leaderboards.forEach(({ sample, scores }) => {
    if (sample > lastSample) {
      lastSample = sample
    }
    scores.forEach((score) => {
      values.push(sample + ':' + score[0], score[1])
    })
  })
  if (values.length === 0) {
    return
  }
  await redisEvalsha(
    await setGraphScript,
    2,
    'graph',
    'graph-update',
    JSON.stringify(values),
    lastSample
  )
}

export const getGraph = async ({ division, maxTeams }) => {
  const samples = calcSamples({
    start: config.startTime,
    end: Math.min(Date.now(), config.endTime)
  })
  const redisResult = await redisEvalsha(
    await getGraphScript,
    3,
    getLeaderboardKey(division),
    'leaderboard-update',
    'graph',
    maxTeams,
    JSON.stringify(samples)
  )
  if (redisResult === null) {
    return []
  }
  const parsed = JSON.parse(redisResult)
  const lastUpdate = parseInt(parsed[0])
  const latest = parsed[1]
  let graphData
  if (Array.isArray(parsed[2])) {
    graphData = parsed[2].flat()
  } else {
    graphData = []
  }
  const result = []
  for (let userIdx = 0; userIdx < latest.length / 3; userIdx++) {
    const points = [{
      time: lastUpdate,
      score: parseInt(latest[userIdx * 3 + 2])
    }]
    for (let sampleIdx = samples.length - 1; sampleIdx >= 0; sampleIdx--) {
      const score = graphData[userIdx * samples.length + sampleIdx]
      if (score === false) {
        continue
      }
      points.push({
        time: samples[sampleIdx],
        score: parseInt(score)
      })
    }
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

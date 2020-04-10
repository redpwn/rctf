const { promisify } = require('util')
const client = require('./client')
const config = require('../../config/server')
const { calcSamples } = require('../leaderboard/samples')

const redisEvalsha = promisify(client.evalsha.bind(client))
const redisHget = promisify(client.hget.bind(client))
const redisHmget = promisify(client.hmget.bind(client))
const redisDel = promisify(client.del.bind(client))
const redisGet = promisify(client.get.bind(client))
const redisScript = promisify(client.script.bind(client))

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
  local challengeScores = cjson.decode(ARGV[3])

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
  chunkCall("HSET", KEYS[1], positionKeys)
  chunkCall("HSET", KEYS[2], challengeScores)
  chunkCall("RPUSH", KEYS[3], globalBoard)
  redis.call("SET", KEYS[4], ARGV[4])
  for i, division in ipairs(divisions) do
    local divisionBoard = divisionBoards[division]
    if #divisionBoard ~= 0 then
      chunkCall("RPUSH", KEYS[i + 4], divisionBoard)
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
    for s = 1, #samples, 1 do
      graphKeys[#graphKeys + 1] = samples[s] .. ":" .. id
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

const setLeaderboard = async ({ challengeScores, leaderboard }) => {
  const divisions = Object.values(config.divisions)
  const divisionKeys = divisions.map((division) => 'division-leaderboard:' + division)
  const keys = [
    'score-positions',
    'challenge-scores',
    'global-leaderboard',
    'leaderboard-update',
    ...divisionKeys
  ]
  if (leaderboard.length === 0) {
    await redisDel(...keys)
  } else {
    await redisEvalsha(
      await setLeaderboardScript,
      keys.length,
      ...keys,
      JSON.stringify(leaderboard.flat()),
      JSON.stringify(divisions),
      JSON.stringify(challengeScores),
      Date.now()
    )
  }
}

const getLeaderboardKey = (division) => {
  if (division === undefined) {
    return 'global-leaderboard'
  } else {
    return 'division-leaderboard:' + division
  }
}

const getRange = async ({ start, end, division }) => {
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

const getScore = async ({ id }) => {
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

const getChallengeScores = async ({ ids }) => {
  if (ids.length === 0) {
    return []
  }
  const redisResult = await redisHmget('challenge-scores', ...ids)
  return redisResult.map((score) => parseInt(score))
}

const setGraph = async ({ leaderboards }) => {
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

const getGraph = async ({ division, maxTeams }) => {
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
  const graphData = parsed[2].flat()
  const result = []
  for (let userIdx = 0; userIdx < latest.length / 3; userIdx++) {
    const points = [{
      time: lastUpdate,
      score: parseInt(latest[userIdx * 3 + 2])
    }]
    let graphComputed = false
    for (let sampleIdx = samples.length - 1; sampleIdx >= 0; sampleIdx--) {
      const score = graphData[userIdx * samples.length + sampleIdx]
      if (score === false && !graphComputed) {
        continue
      } else {
        graphComputed = true
      }
      points.push({
        time: samples[sampleIdx],
        score: score === false ? 0 : parseInt(score)
      })
    }
    if (!graphComputed) {
      points.push({
        time: samples[samples.length - 1],
        score: 0
      })
      points.push({
        time: config.startTime,
        score: 0
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

const getGraphUpdate = async () => {
  const redisResult = await redisGet('graph-update')
  if (redisResult === null) {
    return null
  }
  return parseInt(redisResult)
}

module.exports = {
  setLeaderboard,
  setGraph,
  getRange,
  getScore,
  getChallengeScores,
  getGraph,
  getGraphUpdate
}

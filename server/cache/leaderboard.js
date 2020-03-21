const { promisify } = require('util')
const client = require('./client')
const config = require('../../config/server')

const redisEvalsha = promisify(client.evalsha.bind(client))
const redisHget = promisify(client.hget.bind(client))
const redisHmget = promisify(client.hmget.bind(client))
const redisDel = promisify(client.del.bind(client))
const redisScript = promisify(client.script.bind(client))

const setLeaderboardScript = redisScript('load', `
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
  redis.call("HSET", KEYS[1], unpack(positionKeys))
  redis.call("HSET", KEYS[2], unpack(challengeScores))
  redis.call("RPUSH", KEYS[3], unpack(globalBoard))
  for i, division in ipairs(divisions) do
    local divisionBoard = divisionBoards[division]
    if #divisionBoard ~= 0 then
      redis.call("RPUSH", KEYS[i + 3], unpack(divisionBoard))
    end
  end
`)

const getRangeScript = redisScript('load', `
  local result = redis.call("LRANGE", KEYS[1], ARGV[1], ARGV[2])
  result[#result + 1] = redis.call("LLEN", KEYS[1])
  return result
`)

const setLeaderboard = async ({ challengeScores, leaderboard }) => {
  const divisions = Object.values(config.divisions)
  const divisionKeys = divisions.map((division) => 'division-leaderboard:' + division)
  const keys = [
    'score-positions',
    'challenge-scores',
    'global-leaderboard',
    ...divisionKeys
  ]
  if (leaderboard.length === 0) {
    await redisDel(...keys)
  } else {
    await redisEvalsha(
      await setLeaderboardScript,
      3 + divisionKeys.length,
      ...keys,
      JSON.stringify(leaderboard.flat()),
      JSON.stringify(divisions),
      JSON.stringify(challengeScores)
    )
  }
}

const getRange = async ({ start, end, division }) => {
  let redisList = 'global-leaderboard'
  if (division !== undefined) {
    redisList = 'division-leaderboard:' + division
  }
  const redisResult = await redisEvalsha(
    await getRangeScript,
    1,
    redisList,
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

module.exports = {
  setLeaderboard,
  getRange,
  getScore,
  getChallengeScores
}

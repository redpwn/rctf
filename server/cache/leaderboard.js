const { promisify } = require('util')
const client = require('./client')

const redisEval = promisify(client.eval.bind(client))
const redisHget = promisify(client.hget.bind(client))
const redisDel = promisify(client.del.bind(client))

const setLeaderboardScript = `
  local leaderboard = cjson.decode(ARGV[1])
  local positionKeys = {}
  for i = #leaderboard / 3, 1, -1 do
    positionKeys[i * 2] = i .. "," .. leaderboard[i * 3]
    positionKeys[i * 2 - 1] = leaderboard[i * 3 - 2]
  end
  redis.call("DEL", KEYS[1])
  redis.call("RPUSH", KEYS[1], unpack(leaderboard))
  redis.call("DEL", KEYS[2])
  redis.call("HSET", KEYS[2], unpack(positionKeys))
`

const getRangeScript = `
  local result = redis.call("LRANGE", KEYS[1], ARGV[1], ARGV[2])
  result[#result + 1] = redis.call("LLEN", KEYS[1])
  return result
`

const setLeaderboard = async (leaderboard) => {
  if (leaderboard.length === 0) {
    await redisDel('leaderboard', 'score-positions')
  } else {
    await redisEval(
      setLeaderboardScript,
      2,
      'leaderboard',
      'score-positions',
      JSON.stringify(leaderboard.flat())
    )
  }
}

const getRange = async ({ start, end }) => {
  const redisResult = await redisEval(
    getRangeScript,
    1,
    'leaderboard',
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
    place: parseInt(split[0]),
    score: parseInt(split[1])
  }
}

module.exports = {
  setLeaderboard,
  getRange,
  getScore
}

const { promisify } = require('util')
const client = require('./client')

const redisEval = promisify(client.eval.bind(client))
const redisLrange = promisify(client.lrange.bind(client))

const setLeaderboard = async (leaderboard) => {
  if (leaderboard.length === 0) {
    return
  }
  await redisEval(
    'redis.call("DEL", KEYS[1]); redis.call("RPUSH", KEYS[1], unpack(cjson.decode(ARGV[1])))',
    1,
    'leaderboard',
    JSON.stringify(leaderboard.flat())
  )
}

const getRange = async ({ start, end }) => {
  let redisResult = []
  try {
    redisResult = await redisLrange('leaderboard', start * 3, end * 3 - 1)
  } catch (e) {}
  const result = []
  for (let i = 0; i < redisResult.length / 3; i++) {
    result.push([redisResult[i], redisResult[i + 1], parseInt(redisResult[i + 2])])
  }
  return result
}

module.exports = {
  setLeaderboard,
  getRange
}

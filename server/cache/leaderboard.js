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
  const redisResult = await redisLrange('leaderboard', start * 3, end * 3 - 1)
  const result = []
  for (let i = 0; i < redisResult.length; i += 3) {
    // format the flat redis list response into an array of arrays
    // i is the user id, i + 1 is the user name, i + 2 is the user score
    result.push({
      id: redisResult[i],
      name: redisResult[i + 1],
      score: parseInt(redisResult[i + 2])
    })
  }
  return result
}

module.exports = {
  setLeaderboard,
  getRange
}

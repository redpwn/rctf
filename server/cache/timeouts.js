import { promisify } from 'util'
import client from './client'

const redisScript = promisify(client.script.bind(client))
const redisEvalsha = promisify(client.evalsha.bind(client))

const rateLimitScript = redisScript('load', `
  local newValue = tonumber(redis.call("INCR", KEYS[1]))
  if newValue > tonumber(ARGV[1]) then
    return redis.call("PTTL", KEYS[1])
  end
  if newValue == 1 then
    redis.call("PEXPIRE", KEYS[1], ARGV[2])
  end
`)

export const types = {
  FLAG: 'FLAG',
  UPDATE_PROFILE: 'UPDATE_PROFILE'
}

/*
* The method does two things, but is in one database call for performance reasons. Rate limiting
* will be called frequently.
*
* First, the the method checks if the number of events meets the limit.
* If so, it resolves to an object with the `ok` key set to false, and `timeLeft` set
* to the number of milliseconds left until the bucket expires and new requests can be sent.
* Otherwise, the method will resolve to an object with the `ok` key set to true.
*/
export const checkRateLimit = async ({ type, userid, duration, limit }) => {
  const bucketKey = `rl:${type}:${userid}`
  const result = await redisEvalsha(
    await rateLimitScript,
    1,
    bucketKey,
    limit,
    duration
  )
  return {
    ok: result === null,
    timeLeft: result
  }
}

export const getChallengeType = (name) => {
  return `${types.FLAG}:${name}`
}

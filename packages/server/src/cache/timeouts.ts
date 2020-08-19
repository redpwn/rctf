import client, { loadScript } from './client'

client.defineCommand('rctfRateLimit', {
  numberOfKeys: 1,
  lua: loadScript('rate-limit')
})
export type scriptRateLimit = (bucketKey: string, limit: string, duration: string) => Promise<number | null>

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
export const checkRateLimit = async ({
  type,
  userid,
  duration,
  limit
}: {
  type: string,
  userid: string,
  duration: number,
  limit: number
}): Promise<{ ok: boolean, timeLeft: number | null }> => {
  const bucketKey = `rl:${type}:${userid}`
  const result = await client.rctfRateLimit(
    bucketKey,
    limit.toString(),
    duration.toString()
  )
  return {
    ok: result === null,
    timeLeft: result
  }
}

export const getChallengeType = (name: string): string => {
  return `${types.FLAG}:${name}`
}

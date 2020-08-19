import { Opaque, MergeExclusive } from 'type-fest'
import client, { loadScript } from './client'
import { User } from '../database/users'

client.defineCommand('rctfRateLimit', {
  numberOfKeys: 1,
  lua: loadScript('rate-limit')
})
export type scriptRateLimit = (bucketKey: string, limit: string, duration: string) => Promise<number | null>

const typePrefixes = {
  FLAG: 'FLAG'
}

export enum types {
  UPDATE_PROFILE = 'UPDATE_PROFILE'
}

const enum _prefixType {}
type PrefixType = Opaque<string, _prefixType>
export type RateLimitType = types | PrefixType

export const getChallengeType = (name: string): PrefixType => {
  return `${typePrefixes.FLAG}:${name}` as PrefixType
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
export interface CheckRateLimitRequest {
  type: RateLimitType
  userid: User['id']
  duration: number
  limit: number
}
export type CheckRateLimitResponse = MergeExclusive<{ ok: true }, { ok: false, timeLeft: number }>
export const checkRateLimit = async ({ type, userid, duration, limit }: CheckRateLimitRequest): Promise<CheckRateLimitResponse> => {
  const bucketKey = `rl:${type}:${userid}`
  const redisResult = await client.rctfRateLimit(
    bucketKey,
    limit.toString(),
    duration.toString()
  )
  if (redisResult === null) {
    return { ok: true }
  }
  return { ok: false, timeLeft: redisResult }
}

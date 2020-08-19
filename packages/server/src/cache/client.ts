import path from 'path'
import fs from 'fs'
import Redis, { Redis as IORedis, RedisOptions } from 'ioredis'
import config from '../config/server'
import { scriptRateLimit } from './timeouts'
import { scriptSetLeaderboard, scriptGetRange, scriptSetGraph, scriptGetGraph } from './leaderboard'

const creds = config.database.redis

type RedisClient = IORedis & {
  rctfRateLimit: scriptRateLimit
  rctfSetLeaderboard: scriptSetLeaderboard
  rctfGetRange: scriptGetRange
  rctfSetGraph: scriptSetGraph
  rctfGetGraph: scriptGetGraph
}

let client: RedisClient

const commonOpts: RedisOptions = {
  dropBufferSupport: true
}

if (typeof creds === 'string') {
  client = new Redis(creds, {
    ...commonOpts
  }) as RedisClient
} else {
  client = new Redis({
    ...commonOpts,
    host: creds.host,
    port: creds.port,
    password: creds.password,
    db: creds.database
  }) as RedisClient
}

export const subClient = client.duplicate()

export const loadScript = (name: string): string => {
  const filePath = path.join(__dirname, 'scripts', name + '.lua')
  const content = fs.readFileSync(filePath).toString()
  const matcher = (match: string, quote: string, name: string): string => loadScript(name)
  return content.replace(/^%include\s*(['"])(.+?)\1\s*(?=--|$)/mg, matcher)
}

export default client

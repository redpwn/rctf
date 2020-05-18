import redis from 'redis'
import config from '../../config/server'

const client = redis.createClient({
  url: config.redisUrl
})

export default client

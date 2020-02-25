const redis = require('redis')
const config = require('../../config/server')

const client = redis.createClient({
  url: config.redisUrl
})

module.exports = client

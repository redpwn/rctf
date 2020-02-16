const redis = require('redis')
const config = require('../../config')

const client = redis.createClient({
  url: config.redisUrl
})

module.exports = client

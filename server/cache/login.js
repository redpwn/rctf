const { promisify } = require('util')
const redis = require('redis')
const config = require('../../config')

const client = redis.createClient({
  url: process.env.RCTF_REDIS_URL
})

const prefixes = {
  login: 'l'
}

const redisSet = promisify(client.set.bind(client))

const makeLogin = async ({ id }) => {
  await redisSet(`${prefixes.login}:${id}`, '0', 'px', config.loginTimeout)
}

const useLogin = async ({ id }) => {
  await redisSet(`${prefixes.login}:${id}`, '1', 'xx', 'keepttl')
}

module.exports = {
  makeLogin,
  useLogin
}

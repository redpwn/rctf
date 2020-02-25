const { promisify } = require('util')
const config = require('../../config/server')
const client = require('./client')

const redisSet = promisify(client.set.bind(client))
const redisDel = promisify(client.del.bind(client))

const makeLogin = async ({ id }) => {
  await redisSet(`login:${id}`, '0', 'px', config.loginTimeout)
}

const useLogin = async ({ id }) => {
  const result = await redisDel(`login:${id}`)
  return result === 1
}

module.exports = {
  makeLogin,
  useLogin
}

const { promisify } = require('util')
const config = require('../../config')
const client = require('./client')

const prefixes = {
  login: 'l'
}

const redisSet = promisify(client.set.bind(client))
const redisDel = promisify(client.del.bind(client))

const makeLogin = async ({ id }) => {
  await redisSet(`${prefixes.login}:${id}`, '0', 'px', config.loginTimeout)
}

const useLogin = async ({ id }) => {
  const result = await redisDel(`${prefixes.login}:${id}`)
  return result === 1
}

module.exports = {
  makeLogin,
  useLogin
}

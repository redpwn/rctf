const test = require('ava')

const app = require('fastify')()
const { init } = require('../../../dist/server/uploads')
init(app)

const challenges = require('../../../dist/server/challenges')

test('get all challenges', t => {
  const data = challenges.getAllChallenges()

  t.true(Array.isArray(data))
})

const app = require('fastify')()
const { init } = require('../../../src/uploads')
init(app)

const challenges = require('../../../src/challenges')

test('get all challenges', () => {
  const data = challenges.getAllChallenges()

  expect(Array.isArray(data)).toBe(true)
})

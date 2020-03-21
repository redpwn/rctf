const test = require('ava')

const challenges = require('../../dist/server/challenges')

test('get all challenges', t => {
  const data = challenges.getAllChallenges()

  t.true(Array.isArray(data))
})

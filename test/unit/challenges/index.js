const test = require('ava')

const app = require('express')()
const { init } = require('../../../dist/server/uploads')
// RDeployBlob has a dependency on file upload, we should initalize just in case
init(app)

const challenges = require('../../../dist/server/challenges')

test('get all challenges', t => {
  const data = challenges.getAllChallenges()

  t.true(Array.isArray(data))
})

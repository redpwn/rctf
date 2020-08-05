const test = require('ava')
const request = require('supertest')
const app = require('../../dist/server/app').default
const util = require('../_util')
const auth = require('../../dist/server/auth')
const { default: config } = require('../../dist/server/config/server')

const { responseList } = require('../../dist/server/responses')

let uuid, testUserData

test.before('start server', async t => {
  await app.ready()
})

test.before(async () => {
  testUserData = await util.generateRealTestUser()
  uuid = testUserData.user.id
})

test.after.always('cleanup test user', async t => {
  await testUserData.cleanup()
})

test('fails with unauthorized', async t => {
  const resp = await request(app.server)
    .get(process.env.API_ENDPOINT + '/challs')
    .expect(responseList.badToken.status)

  t.is(resp.body.kind, 'badToken')
})

test.serial('fails with badNotStarted', async t => {
  const oldTime = config.startTime
  // Choose a time 10 minutes in the future
  config.startTime = Date.now() + 10 * 60 * 1000

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .get(process.env.API_ENDPOINT + '/challs')
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.badNotStarted.status)

  t.is(resp.body.kind, 'badNotStarted')

  config.startTime = oldTime
})

test.serial('succeeds with goodChallenges', async t => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .get(process.env.API_ENDPOINT + '/challs')
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.goodChallenges.status)

  t.is(resp.body.kind, 'goodChallenges')
  t.true(Array.isArray(resp.body.data))
})

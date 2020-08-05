const test = require('ava')
const request = require('supertest')
const app = require('../../dist/server/app').default
const { default: config } = require('../../dist/server/config/server')
const util = require('../_util')

const { responseList } = require('../../dist/server/responses')
const auth = require('../../dist/server/auth')
const { getFirstLoadedChallenge } = require('../_util.js')

let chall, uuid, testUserData

test.before('start server', async t => {
  await app.ready()
})

test.before(async () => {
  chall = await getFirstLoadedChallenge()
  testUserData = await util.generateRealTestUser()
  uuid = testUserData.user.id
})

test.after.always('cleanup test user', async t => {
  await testUserData.cleanup()
})

test.serial('fails with badNotStarted', async t => {
  const oldTime = config.startTime
  // Choose a time 10 minutes in the future
  config.startTime = Date.now() + 10 * 60 * 1000

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.badNotStarted.status)

  t.is(resp.body.kind, 'badNotStarted')

  config.startTime = oldTime
})

test.serial('fails with badEnded', async t => {
  const oldTime = config.endTime
  config.endTime = Date.now() - 1

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.badEnded.status)

  t.is(resp.body.kind, 'badEnded')

  config.endTime = oldTime
})

const request = require('supertest')
const app = require('../../src/app').default
const { default: config } = require('../../src/config/server')
const util = require('../_util')

const { responseList } = require('../../src/responses')
const auth = require('../../src/auth')
const { getFirstLoadedChallenge } = require('../_util.js')

let chall, uuid, testUserData

beforeAll(async () => {
  await app.ready()
})

beforeAll(async () => {
  chall = await getFirstLoadedChallenge()
  testUserData = await util.generateRealTestUser()
  uuid = testUserData.user.id
})

afterAll(async () => {
  await testUserData.cleanup()
})

test('fails with badNotStarted', async () => {
  const oldTime = config.startTime
  // Choose a time 10 minutes in the future
  config.startTime = Date.now() + 10 * 60 * 1000

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.badNotStarted.status)

  expect(resp.body.kind).toBe('badNotStarted')

  config.startTime = oldTime
})

test('fails with badEnded', async () => {
  const oldTime = config.endTime
  config.endTime = Date.now() - 1

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.badEnded.status)

  expect(resp.body.kind).toBe('badEnded')

  config.endTime = oldTime
})

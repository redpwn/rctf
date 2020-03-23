const test = require('ava')
const request = require('supertest')
const app = require('../../dist/server/app')
const { v4: uuidv4 } = require('uuid')
const auth = require('../../dist/server/auth')
const config = require('../../dist/config/server')

const { responseList } = require('../../dist/server/responses')

test('fails with unauthorized', async t => {
  const resp = await request(app)
    .get(process.env.API_ENDPOINT + '/challs')
    .expect(responseList.badToken.status)

  t.is(resp.body.kind, 'badToken')
})

const uuid = uuidv4()

test.serial('fails with badNotStarted', async t => {
  const oldTime = config.startTime
  // Choose a time 10 minutes in the future
  config.startTime = Date.now() + 10 * 60 * 1000

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
    .get(process.env.API_ENDPOINT + '/challs')
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.badNotStarted.status)

  t.is(resp.body.kind, 'badNotStarted')

  config.startTime = oldTime
})

test.serial('succeeds with goodChallenges', async t => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
    .get(process.env.API_ENDPOINT + '/challs')
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.goodChallenges.status)

  t.is(resp.body.kind, 'goodChallenges')
  t.true(Array.isArray(resp.body.data))
})

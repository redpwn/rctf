const test = require('ava')
const request = require('supertest')
const app = require('../../app')
const uuidv4 = require('uuid/v4')
const auth = require('../../server/auth')
const config = require("../../config")

const { responseList } = require('../../server/responses')

test('fails with unauthorized', async t => {
  const resp = await request(app)
    .get(process.env.API_ENDPOINT + '/challs')
    .expect(responseList.badToken.status)

  t.is(resp.body.kind, 'badToken')
})

const uuid = uuidv4()

test.serial('fails with badNotStarted', async t => {
  const oldTime = config.startTime;
  // Choose a time 10 minutes in the future
  config.startTime = Date.now() + 3023420340234020;

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
    .get(process.env.API_ENDPOINT + `/challs`)
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.badNotStarted.status)

  t.is(resp.body.kind, 'badNotStarted')

  config.startTime = oldTime
})

test.serial('succeeds with goodChallenges', async t => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
    .get(process.env.API_ENDPOINT + `/challs`)
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.goodChallenges.status)

    t.is(resp.body.kind, 'goodChallenges')
    t.truthy(Array.isArray(resp.body.data))
})

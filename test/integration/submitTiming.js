const test = require('ava')
const request = require('supertest')
const app = require('../../app')
const config = require('../../config/server')
const uuidv4 = require('uuid/v4')

const { responseList } = require('../../server/responses')
const auth = require('../../server/auth')
const { getFirstLoadedChallenge } = require('../_util.js')

let chall

// Wait for challenges to load
test.before(async () => {
  chall = await getFirstLoadedChallenge()
})

const uuid = uuidv4()

test.serial('fails with badNotStarted', async t => {
  const oldTime = config.startTime
  // Choose a time 10 minutes in the future
  config.startTime = Date.now() + 10 * 60 * 1000

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
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
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.badEnded.status)

  t.is(resp.body.kind, 'badEnded')

  config.endTime = oldTime
})

const test = require('ava')
const request = require('supertest')
const app = require('../../app')
const config = require('../../config')
const uuidv4 = require('uuid/v4')

const db = require('../../server/database')
const challenges = require('../../server/challenges')
const { responseList } = require('../../server/responses')
const auth = require('../../server/auth')

const chall = challenges.getAllChallenges()[0]

test('fails with unauthorized', async t => {
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/1/submit')
    .expect(responseList.badToken.status)

  t.is(resp.body.kind, 'badToken')
})

const uuid = uuidv4()

test('fails with badBody', async t => {
  const badChallenge = uuidv4()

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + `/challs/${encodeURIComponent(badChallenge)}/submit`)
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.badBody.status)

  t.is(resp.body.kind, 'badBody')
})

test.serial('fails with badFlag', async t => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: 'wrong_flag' })
    .expect(responseList.badFlag.status)

  t.is(resp.body.kind, 'badFlag')
})

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

test.serial('succeeds with goodFlag', async t => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.goodFlag.status)

  t.is(resp.body.kind, 'goodFlag')
})

test.serial('fails with alreadySolved', async t => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.alreadySolved.status)

  t.is(resp.body.kind, 'alreadySolved')
})

test.after.always('remove solves from test user', async t => {
  await db.solves.removeSolvesByUserId({ userid: uuid })
})

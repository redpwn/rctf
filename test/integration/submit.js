const test = require('ava')
const request = require('supertest')
const app = require('../../dist/server/app')
const { v4: uuidv4 } = require('uuid')

const db = require('../../dist/server/database')
const { responseList } = require('../../dist/server/responses')
const auth = require('../../dist/server/auth')
const util = require('../_util')

let chall, uuid, testUserData

// Wait for challenges to load
test.before(async () => {
  chall = await util.getFirstLoadedChallenge()

  testUserData = await util.generateRealTestUser()
  uuid = testUserData.user.id
})

test.after.always('cleanup test user', async t => {
  await db.solves.removeSolvesByUserId({ userid: uuid })
  await testUserData.cleanup()
})

test('fails with unauthorized', async t => {
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/1/submit')
    .expect(responseList.badToken.status)

  t.is(resp.body.kind, 'badToken')
})

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

test.serial('succeeds with goodFlag', async t => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.goodFlag.status)

  t.is(resp.body.kind, 'goodFlag')
})

test.serial('fails with badAlreadySolvedChallenge', async t => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.badAlreadySolvedChallenge.status)

  t.is(resp.body.kind, 'badAlreadySolvedChallenge')
})

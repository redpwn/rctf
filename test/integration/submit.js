const test = require('ava')
const request = require('supertest')
const app = require('../../app')
const uuidv4 = require('uuid/v4')

const db = require('../../server/database')
const challenges = require('../../server/challenges')
const { responseList } = require('../../server/responses')
const auth = require('../../server/auth')
const util = require('../util')

const chall = challenges.getAllChallenges()[0]

test('fails with unauthorized', async t => {
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/1/submit')
    .expect(responseList.badToken.status)

  t.is(resp.body.kind, 'badToken')
})

const uuid = uuidv4()
const testUser = {
  ...util.generateTestUser(),
  id: uuid,
  perms: 0
}

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
  await db.auth.makeUser(testUser)

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

test.after.always('remove solves from test user', async t => {
  await db.solves.removeSolvesByUserId({ userid: uuid })
  await db.auth.removeUserById({
    id: testUser.id
  })
})

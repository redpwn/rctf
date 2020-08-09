const request = require('supertest')
const app = require('../../src/app').default
const { v4: uuidv4 } = require('uuid')

const db = require('../../src/database')
const { responseList } = require('../../src/responses')
const auth = require('../../src/auth')
const util = require('../_util')

let chall, uuid, testUserData

beforeAll(async () => {
  await app.ready()
})

beforeAll(async () => {
  chall = await util.getFirstLoadedChallenge()

  testUserData = await util.generateRealTestUser()
  uuid = testUserData.user.id
})

afterAll('cleanup test user', async () => {
  await db.solves.removeSolvesByUserId({ userid: uuid })
  await testUserData.cleanup()
})

test('fails with unauthorized', async () => {
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/challs/1/submit')
    .send({ flag: 'wrong_flag' })
    .expect(responseList.badToken.status)

  expect(resp.body.kind).toBe('badToken')
})

test('fails with badBody', async () => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.badBody.status)

  expect(resp.body.kind).toBe('badBody')
})

test('fails with badChallenge', async () => {
  const badChallenge = uuidv4()

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + `/challs/${encodeURIComponent(badChallenge)}/submit`)
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: 'wrong_flag' })
    .expect(responseList.badChallenge.status)

  expect(resp.body.kind).toBe('badChallenge')
})

test('fails with badFlag', async () => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: 'wrong_flag' })
    .expect(responseList.badFlag.status)

  expect(resp.body.kind).toBe('badFlag')
})

test('succeeds with goodFlag', async () => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.goodFlag.status)

  expect(resp.body.kind).toBe('goodFlag')
})

test('fails with badAlreadySolvedChallenge', async () => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responseList.badAlreadySolvedChallenge.status)

  expect(resp.body.kind).toBe('badAlreadySolvedChallenge')
})

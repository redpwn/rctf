const test = require('ava')
const request = require('supertest')
const app = require('../../app')
const uuidv4 = require('uuid/v4')

const db = require('../../server/database')
const challenges = require('../../server/challenges')
const { responses } = require('../../server/responses')
const auth = require('../../server/auth')

const chall = challenges.getAllChallenges()[0]

test('fails with unauthorized', async t => {
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/1/submit')
    .expect(401)

  t.is(resp.body.kind, 'badToken')
})

const uuid = uuidv4()

test('fails with badBody', async t => {
  const badChallenge = uuidv4()

  const authToken = await auth.token.getToken(uuid)
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + `/challs/${badChallenge}/submit`)
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responses.badBody.status)

  t.is(resp.body.kind, 'badBody')
})

test.serial('fails with badFlag', async t => {
  const authToken = await auth.token.getToken(uuid)
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: 'wrong_flag' })
    .expect(responses.badFlag.status)

  t.is(resp.body.kind, 'badFlag')
})

test.serial('succeeds with goodFlag', async t => {
  const authToken = await auth.token.getToken(uuid)
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responses.goodFlag.status)

  t.is(resp.body.kind, 'goodFlag')
})

test.serial('fails with alreadySolved', async t => {
  const authToken = await auth.token.getToken(uuid)
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(responses.alreadySolved.status)

  t.is(resp.body.kind, 'alreadySolved')
})

test.after.always('remove solves from test user', async t => {
  await db.solves.removeSolvesByUserId({ userid: uuid })
})

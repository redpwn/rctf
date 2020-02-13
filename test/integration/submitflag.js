const test = require('ava')
const request = require('supertest')
const app = require('../../app')

const db = require('../../server/database')
const challenges = require('../../server/challenges')
const auth = require('../../server/auth')

const chall = challenges.getAllChallenges()[0]

test('fails with unauthorized', async t => {
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/1/submit')
    .expect(401)

  t.is(resp.body.kind, 'badToken')
})

test('fails with badBody', async t => {
  const authToken = await auth.token.getToken('5b7790fd-6922-4a06-9f8c-1dcbc9ae165f')
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/ATfo410xfN_TEST/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .expect(400)

  t.is(resp.body.kind, 'badBody')
})

test.serial('fails with badFlag', async t => {
  const authToken = await auth.token.getToken('5b7790fd-6922-4a06-9f8c-1dcbc9ae165f')
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: 'wrong_flag' })
    .expect(200)

  t.is(resp.body.kind, 'badFlag')
})

test.serial('succeeds with goodFlag', async t => {
  const authToken = await auth.token.getToken('5b7790fd-6922-4a06-9f8c-1dcbc9ae165f')
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(200)

  t.is(resp.body.kind, 'goodFlag')
})

test.serial('fails with alreadySolved', async t => {
  const authToken = await auth.token.getToken('5b7790fd-6922-4a06-9f8c-1dcbc9ae165f')
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/challs/' + encodeURIComponent(chall.id) + '/submit')
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(200)

  t.is(resp.body.kind, 'alreadySolved')
})

test.after.always('remove solves from test user', async t => {
  await db.solves.removeSolvesByUserId({ userid: '5b7790fd-6922-4a06-9f8c-1dcbc9ae165f' })
})

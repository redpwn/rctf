const test = require('ava')
const request = require('supertest')
const app = require('../../app')
const { removeUserByEmail } = require('../../server/database').auth

const config = require('../../config')
const { responseList } = require('../../server/responses')

const testUser = {
  email: 'test@test.com',
  name: 'test',
  division: Object.values(config.divisions)[0]
}

test('fails with badEmail', async t => {
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/submit')
    .send({
      ...testUser,
      register: true,
      email: 'notanemail'
    })
    .expect(responseList.badEmail.status)

  t.is(resp.body.kind, 'badEmail')
})

test('fails with badUnknownEmail', async t => {
  const unknownEmail = 'non-existent-email' + Math.random() + '@gmail.com'
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/submit')
    .send({
      ...testUser,
      register: false,
      email: unknownEmail
    })
    .expect(responseList.badUnknownEmail.status)

  t.is(resp.body.kind, 'badUnknownEmail')
})

test.serial('when not verifyEmail, succeeds with goodVerify', async t => {
  config.verifyEmail = false

  let resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/submit')
    .send({
      ...testUser,
      register: true
    })
    .expect(responseList.goodVerify.status)

  t.is(resp.body.kind, 'goodVerify')
  t.true(typeof resp.body.data.authToken === 'string')
  t.true(typeof resp.body.data.teamToken === 'string')

  resp = await request(app)
    .get(process.env.API_ENDPOINT + '/auth/test')
    .set('Authorization', ' Bearer ' + resp.body.data.authToken)
    .expect(responseList.validToken.status)

  t.is(resp.body.kind, 'validToken')

  config.verifyEmail = true
})

test.serial('duplicate fails with badKnownEmail', async t => {
  config.verifyEmail = false

  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/submit')
    .send({
      ...testUser,
      register: true
    })
    .expect(responseList.badKnownEmail.status)

  t.is(resp.body.kind, 'badKnownEmail')
})

// TODO: remember too remove test user

test.after.always('cleanup test user', async t => {
  await removeUserByEmail({
    email: testUser.email
  })
})

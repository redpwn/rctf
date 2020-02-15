const test = require('ava')
const request = require('supertest')
const app = require('../../app')

const config = require('../../config')
const { responses } = require('../../server/responses')

const testUser = {
  email: 'test@test.com',
  name: 'test',
  division: config.divisions[0]
}

test('fails with badEmail', async t => {
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/submit')
    .send({
      register: true,
      email: 'notanemail',
      ...testUser
    })
    .expect(responses.badEmail.status)

  t.is(resp.body.kind, 'badEmail')
})

test('fails with badUnknownEmail', async t => {
  const unknownEmail = 'non-existent-email' + Math.random() + '@gmail.com'
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/submit')
    .send({
      register: false,
      email: unknownEmail,
      ...testUser
    })
    .expect(responses.badUnknownEmail.status)

  t.is(resp.body.kind, 'badUnknownEmail')
})

test.serial('when not verifyEmail, succeeds with goodVerify', async t => {
  config.verifyEmail = false

  let resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/submit')
    .send({
      register: true,
      ...testUser
    })
    .expect(responses.goodVerify.status)

  t.is(resp.body.kind, 'goodVerify')
  t.truthy(resp.body.data.authToken instanceof String)
  t.truthy(resp.body.data.teamToken instanceof String)

  resp = await request(app)
    .get(process.env.API_ENDPOINT + '/auth/test')
    .set('Authorization', ' Bearer ' + resp.body.data.authToken)
    .expect(responses.validToken.status)

  t.is(resp.body.kind, 'validToken')
})

test.serial('duplicate fails with badKnownEmail', async t => {
  config.verifyEmail = false

  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/submit')
    .send({
      register: true,
      ...testUser
    })
    .expect(responses.badKnownEmail.status)

  t.is(resp.body.kind, 'badKnownEmail')
})

// TODO: remember too remove test user

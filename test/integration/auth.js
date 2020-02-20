const test = require('ava')
const request = require('supertest')
const app = require('../../app')
const uuidv4 = require('uuid/v4')
const { removeUserByEmail } = require('../../server/database').auth

const config = require('../../config')
const { responseList } = require('../../server/responses')

const testUser = {
  email: uuidv4() + '@test.com',
  name: uuidv4(),
  division: Object.values(config.divisions)[0]
}

test('fails with badEmail', async t => {
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send({
      ...testUser,
      email: 'notanemail'
    })
    .expect(responseList.badEmail.status)

  t.is(resp.body.kind, 'badEmail')
})

test('fails with badUnknownEmail', async t => {
  config.verifyEmail = true

  const unknownEmail = 'non-existent-email' + Math.random() + '@gmail.com'
  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/recover')
    .send({
      email: unknownEmail
    })
    .expect(responseList.badUnknownEmail.status)

  t.is(resp.body.kind, 'badUnknownEmail')
})

test.serial('when not verifyEmail, succeeds with goodVerify', async t => {
  config.verifyEmail = false

  let resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send({
      ...testUser
    })
    .expect(responseList.goodRegister.status)

  t.is(resp.body.kind, 'goodRegister')
  t.true(typeof resp.body.data.authToken === 'string')
  t.true(typeof resp.body.data.teamToken === 'string')

  resp = await request(app)
    .get(process.env.API_ENDPOINT + '/auth/test')
    .set('Authorization', ' Bearer ' + resp.body.data.authToken)
    .expect(responseList.validToken.status)

  t.is(resp.body.kind, 'validToken')
})

test.serial('duplicate email fails with badKnownEmail', async t => {
  config.verifyEmail = false

  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send({
      ...testUser,
      name: String(Math.random())
    })
    .expect(responseList.badKnownEmail.status)

  t.is(resp.body.kind, 'badKnownEmail')
})

test.serial('duplicate name fails with badKnownName', async t => {
  config.verifyEmail = false

  const resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send({
      ...testUser,
      email: 'non-existent-email' + String(Math.random()) + '@gmail.com'
    })
    .expect(responseList.badKnownName.status)

  t.is(resp.body.kind, 'badKnownName')
})

test.after.always('cleanup test user', async t => {
  await removeUserByEmail({
    email: testUser.email
  })
})

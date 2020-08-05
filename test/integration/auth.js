const test = require('ava')
const request = require('supertest')
const app = require('../../dist/server/app').default
const { removeUserByEmail } = require('../../dist/server/database').users

const { default: config } = require('../../dist/server/config/server')
const { responseList } = require('../../dist/server/responses')
const database = require('../../dist/server/database')
const auth = require('../../dist/server/auth')
const util = require('../_util')

const testUser = util.generateTestUser()

let oldEmail = config.email

test.serial.before('start server', async t => {
  oldEmail = config.email
  await app.ready()
})

test.serial.after.always('cleanup test user', async t => {
  config.email = oldEmail
  await removeUserByEmail({
    email: testUser.email
  })
})

test('fails with badEmail', async t => {
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send({
      ...testUser,
      email: 'notanemail'
    })
    .expect(responseList.badEmail.status)

  t.is(resp.body.kind, 'badEmail')
})

test.serial('fails with badUnknownEmail', async t => {
  config.email = oldEmail

  const unknownEmail = 'non-existent-email' + Math.random() + '@gmail.com'
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/recover')
    .send({
      email: unknownEmail
    })
    .expect(responseList.badUnknownEmail.status)

  t.is(resp.body.kind, 'badUnknownEmail')
})

test.serial('when not email, succeeds with goodRegister', async t => {
  config.email = null

  let resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send(testUser)
    .expect(responseList.goodRegister.status)

  t.is(resp.body.kind, 'goodRegister')
  t.true(typeof resp.body.data.authToken === 'string')

  resp = await request(app.server)
    .get(process.env.API_ENDPOINT + '/auth/test')
    .set('Authorization', ' Bearer ' + resp.body.data.authToken)
    .expect(responseList.goodToken.status)

  t.is(resp.body.kind, 'goodToken')
})

test.serial('duplicate email fails with badKnownEmail', async t => {
  config.email = null

  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send({
      ...testUser,
      name: String(Math.random())
    })
    .expect(responseList.badKnownEmail.status)

  t.is(resp.body.kind, 'badKnownEmail')
})

test.serial('duplicate name fails with badKnownName', async t => {
  config.email = null

  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send({
      ...testUser,
      email: 'non-existent-email' + String(Math.random()) + '@gmail.com'
    })
    .expect(responseList.badKnownName.status)

  t.is(resp.body.kind, 'badKnownName')
})

test.serial('succeeds with goodUserUpdate', async t => {
  config.email = null

  const user = await database.users.getUserByEmail({
    email: testUser.email
  })

  const nextUser = util.generateTestUser()

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, user.id)

  const resp = await request(app.server)
    .patch(process.env.API_ENDPOINT + '/users/me')
    .set('Authorization', ' Bearer ' + authToken)
    .send({
      name: nextUser.name,
      division: nextUser.division
    })
    .expect(responseList.goodUserUpdate.status)

  const respUser = resp.body.data.user
  testUser.name = respUser.name
  testUser.email = respUser.email
  testUser.division = respUser.division

  t.is(resp.body.kind, 'goodUserUpdate')

  t.is(respUser.name, nextUser.name)
  t.is(respUser.email, testUser.email)
  t.is(respUser.division, nextUser.division)
})

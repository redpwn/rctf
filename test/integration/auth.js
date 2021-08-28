const test = require('ava')
const request = require('supertest')
const app = require('../../dist/server/app').default

const { default: config } = require('../../dist/server/config/server')
const { responseList } = require('../../dist/server/responses')
const auth = require('../../dist/server/auth')
const util = require('../_util')

let testUser, cleanup, oldEmail

test.serial.before('start server', async t => {
  oldEmail = config.email
  config.email = null
  await app.ready()
})

test.serial.before('add test user', async t => {
  ({ user: testUser, cleanup } = await util.generateRealTestUser())
})

test.serial.after.always('cleanup test user', async t => {
  config.email = oldEmail
  await cleanup()
})

test.serial('succeeds with goodUserUpdate', async t => {
  const nextUser = util.generateTestUser()

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, testUser.id)

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

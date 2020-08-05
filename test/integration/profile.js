const test = require('ava')
const request = require('supertest')
const app = require('../../dist/server/app').default
const { v4: uuidv4 } = require('uuid')

const { default: config } = require('../../dist/server/config/server')
const { removeUserByEmail } = require('../../dist/server/database').users
const { responseList } = require('../../dist/server/responses')

const testUser = {
  email: uuidv4() + '@test.com',
  name: uuidv4(),
  division: Object.values(config.divisions)[0]
}

let oldEmail

test.serial.before('start server', async t => {
  oldEmail = config.email
  config.email = null
  await app.ready()
})

test.serial('succeeds with goodUserData', async t => {
  let resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send(testUser)
    .expect(responseList.goodRegister.status)

  const authToken = resp.body.data.authToken

  resp = await request(app.server)
    .get(process.env.API_ENDPOINT + '/users/me')
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.goodUserData.status)

  t.is(resp.body.kind, 'goodUserData')
  t.is(resp.body.data.name, testUser.name)
})

test.serial.after.always('cleanup test user', async t => {
  await removeUserByEmail({
    email: testUser.email
  })
  config.email = oldEmail
})

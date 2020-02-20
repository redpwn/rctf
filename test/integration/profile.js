const test = require('ava')
const request = require('supertest')
const app = require('../../app')
const uuidv4 = require('uuid/v4')

const config = require('../../config')
const { removeUserByEmail } = require('../../server/database').auth
const { responseList } = require('../../server/responses')

const testUser = {
  email: uuidv4() + '@test.com',
  name: uuidv4(),
  division: Object.values(config.divisions)[0]
}

test.serial('succeeds with goodUserData', async t => {
  config.verifyEmail = false

  let resp = await request(app)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send(testUser)
    .expect(responseList.goodRegister.status)

  const authToken = resp.body.data.authToken

  resp = await request(app)
    .get(process.env.API_ENDPOINT + '/users/me')
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.goodUserData.status)

  t.is(resp.body.kind, 'goodUserData')
  t.is(resp.body.data.name, testUser.name)
})

test.after.always('cleanup test user', async t => {
  await removeUserByEmail({
    email: testUser.email
  })
})

const request = require('supertest')
const app = require('../../src/app').default
const { v4: uuidv4 } = require('uuid')

const { default: config } = require('../../src/config/server')
const { removeUserByEmail } = require('../../src/database').users
const { responseList } = require('../../src/responses')

const testUser = {
  email: uuidv4() + '@test.com',
  name: uuidv4(),
  division: Object.values(config.divisions)[0]
}

let oldEmail

beforeAll(async () => {
  oldEmail = config.email
  config.email = null
  await app.ready()
})

test('succeeds with goodUserData', async () => {
  let resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send(testUser)
    .expect(responseList.goodRegister.status)

  const authToken = resp.body.data.authToken

  resp = await request(app.server)
    .get(process.env.API_ENDPOINT + '/users/me')
    .set('Authorization', ' Bearer ' + authToken)
    .expect(responseList.goodUserData.status)

  expect(resp.body.kind).toBe('goodUserData')
  expect(resp.body.data.name).toBe(testUser.name)
})

afterAll('cleanup test user', async () => {
  await removeUserByEmail({
    email: testUser.email
  })
  config.email = oldEmail
})

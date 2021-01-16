import request from 'supertest'
import app from '../../src/app'
import { v4 as uuidv4 } from 'uuid'
import config from '../../src/config/server'
import { removeUserByEmail } from '../../src/database/users'
import { responseList } from '../../src/responses'
import { goodUserSelfData } from '@rctf/api-types/responses'

const testUser = {
  email: uuidv4() + '@test.com',
  name: uuidv4(),
  division: Object.values(config.divisions)[0],
}

let oldEmail

beforeAll(async () => {
  oldEmail = config.email
  config.email = null
  await app.ready()
})

test('succeeds with goodUserSelfData', async () => {
  let resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send(testUser)
    .expect(responseList.goodRegister.status)

  const authToken = resp.body.data.authToken

  resp = await request(app.server)
    .get(process.env.API_ENDPOINT + '/users/me')
    .set('Authorization', ' Bearer ' + authToken)
    .expect(goodUserSelfData.status)

  expect(resp.body.kind).toBe('goodUserSelfData')
  expect(resp.body.data.name).toBe(testUser.name)
})

afterAll(async () => {
  await removeUserByEmail({
    email: testUser.email,
  })
  config.email = oldEmail
})

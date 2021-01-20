import request from 'supertest'
import app from '../../src/app'
import * as database from '../../src/database'
import config from '../../src/config/server'
import {
  badEmail,
  badUnknownEmail,
  badKnownEmail,
  badKnownName,
  goodRegister,
  goodToken,
  goodUserUpdate,
} from '@rctf/api-types/responses'

import * as auth from '../../src/auth'
import { removeUserByEmail } from '../../src/database/users'
import { generateTestUser } from '../_util'

const testUser = generateTestUser()

let oldEmail = config.email

beforeAll(async () => {
  oldEmail = config.email
  await app.ready()
})

afterAll(async () => {
  config.email = oldEmail
  await removeUserByEmail({
    email: testUser.email,
  })
})

test('fails with badEmail', async () => {
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send({
      ...testUser,
      email: 'notanemail',
    })
    .expect(badEmail.status)

  expect(resp.body.kind).toBe('badEmail')
})

test('fails with badUnknownEmail', async () => {
  config.email = oldEmail

  const unknownEmail = 'non-existent-email' + Math.random() + '@gmail.com'
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/recover')
    .send({
      email: unknownEmail,
    })
    .expect(badUnknownEmail.status)

  expect(resp.body.kind).toBe('badUnknownEmail')
})

test('when not email, succeeds with goodRegister', async () => {
  config.email = null

  let resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send(testUser)
    .expect(goodRegister.status)

  expect(resp.body.kind).toBe('goodRegister')
  expect(typeof resp.body.data.authToken === 'string').toBe(true)

  resp = await request(app.server)
    .get(process.env.API_ENDPOINT + '/auth/test')
    .set('Authorization', ' Bearer ' + resp.body.data.authToken)
    .expect(goodToken.status)

  expect(resp.body.kind).toBe('goodToken')
})

test('duplicate email fails with badKnownEmail', async () => {
  config.email = null

  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send({
      ...testUser,
      name: String(Math.random()),
    })
    .expect(badKnownEmail.status)

  expect(resp.body.kind).toBe('badKnownEmail')
})

test('duplicate name fails with badKnownName', async () => {
  config.email = null

  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/auth/register')
    .send({
      ...testUser,
      email: 'non-existent-email' + String(Math.random()) + '@gmail.com',
    })
    .expect(badKnownName.status)

  expect(resp.body.kind).toBe('badKnownName')
})

test('succeeds with goodUserUpdate', async () => {
  config.email = null

  const user = await database.users.getUserByEmail({
    email: testUser.email,
  })

  const nextUser = generateTestUser()

  const authToken = await auth.token.getToken(
    auth.token.tokenKinds.auth,
    user.id
  )

  const resp = await request(app.server)
    .patch(process.env.API_ENDPOINT + '/users/me')
    .set('Authorization', ' Bearer ' + authToken)
    .send({
      name: nextUser.name,
      division: nextUser.division,
    })
    .expect(goodUserUpdate.status)

  const respUser = resp.body.data.user
  testUser.name = respUser.name
  testUser.email = respUser.email
  testUser.division = respUser.division

  expect(resp.body.kind).toBe('goodUserUpdate')

  expect(respUser.name).toBe(nextUser.name)
  expect(respUser.email).toBe(testUser.email)
  expect(respUser.division).toBe(nextUser.division)
})

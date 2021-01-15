import request from 'supertest'
import app from '../../src/app'
import config from '../../src/config/server'
import { generateChallenge, generateRealTestUser } from '../_util'

import { badNotStarted, badEnded } from '@rctf/api-types/responses'
import * as auth from '../../src/auth'

let chall, challData, uuid, userData

beforeAll(async () => {
  await app.ready()
})

beforeAll(async () => {
  challData = await generateChallenge()
  userData = await generateRealTestUser()
  uuid = userData.user.id
  chall = challData.chall
})

afterAll(async () => {
  await userData.cleanup()
  await challData.cleanup()
})

test('fails with badNotStarted', async () => {
  const oldTime = config.startTime
  // Choose a time 10 minutes in the future
  config.startTime = Date.now() + 10 * 60 * 1000

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(
      process.env.API_ENDPOINT +
        '/challs/' +
        encodeURIComponent(chall.id) +
        '/submit'
    )
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(badNotStarted.status)

  expect(resp.body.kind).toBe('badNotStarted')

  config.startTime = oldTime
})

test('fails with badEnded', async () => {
  const oldTime = config.endTime
  config.endTime = Date.now() - 1

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(
      process.env.API_ENDPOINT +
        '/challs/' +
        encodeURIComponent(chall.id) +
        '/submit'
    )
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: chall.flag })
    .expect(badEnded.status)

  expect(resp.body.kind).toBe('badEnded')

  config.endTime = oldTime
})

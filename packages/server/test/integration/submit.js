import request from 'supertest'
import app from '../../src/app'
import { v4 as uuidv4 } from 'uuid'
import * as db from '../../src/database'
import {
  badToken,
  badBody,
  badFlag,
  badChallenge,
  badAlreadySolvedChallenge,
  goodFlag,
} from '@rctf/api-types/responses'
import * as auth from '../../src/auth'
import { generateChallenge, generateRealTestUser } from '../_util'

let chall, challData, uuid, userData

beforeAll(async () => {
  await app.ready()
})

beforeAll(async () => {
  challData = await generateChallenge()
  userData = await generateRealTestUser()
  chall = challData.chall
  uuid = userData.user.id
})

afterAll(async () => {
  await db.solves.removeSolvesByUserId({ userid: uuid })
  await userData.cleanup()
  await challData.cleanup()
})

test('fails with unauthorized', async () => {
  const resp = await request(app.server)
    .post(process.env.API_ENDPOINT + '/challs/1/submit')
    .send({ flag: 'wrong_flag' })
    .expect(badToken.status)

  expect(resp.body.kind).toBe('badToken')
})

test('fails with badBody', async () => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(
      process.env.API_ENDPOINT +
        '/challs/' +
        encodeURIComponent(chall.id) +
        '/submit'
    )
    .set('Authorization', ' Bearer ' + authToken)
    .expect(badBody.status)

  expect(resp.body.kind).toBe('badBody')
})

test('fails with badChallenge', async () => {
  const badChallengeId = uuidv4()

  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(
      process.env.API_ENDPOINT +
        `/challs/${encodeURIComponent(badChallengeId)}/submit`
    )
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: 'wrong_flag' })
    .expect(badChallenge.status)

  expect(resp.body.kind).toBe('badChallenge')
})

test('fails with badFlag', async () => {
  const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, uuid)
  const resp = await request(app.server)
    .post(
      process.env.API_ENDPOINT +
        '/challs/' +
        encodeURIComponent(chall.id) +
        '/submit'
    )
    .set('Authorization', ' Bearer ' + authToken)
    .send({ flag: 'wrong_flag' })
    .expect(badFlag.status)

  expect(resp.body.kind).toBe('badFlag')
})

test('succeeds with goodFlag', async () => {
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
    .expect(goodFlag.status)

  expect(resp.body.kind).toBe('goodFlag')
})

test('fails with badAlreadySolvedChallenge', async () => {
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
    .expect(badAlreadySolvedChallenge.status)

  expect(resp.body.kind).toBe('badAlreadySolvedChallenge')
})

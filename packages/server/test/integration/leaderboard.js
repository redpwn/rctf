import request from 'supertest'
import app from '../../src/app'
import { responseList } from '../../src/responses'

beforeAll(async () => {
  await app.ready()
})

test('succeeds with goodLeaderboard', async () => {
  const resp = await request(app.server)
    .get(process.env.API_ENDPOINT + '/leaderboard/now')
    .query({ limit: 1, offset: 0 })
    .expect('Content-Type', /json/)
    .expect(responseList.goodLeaderboard.status)

  expect(resp.body.kind).toBe('goodLeaderboard')
  expect(Array.isArray(resp.body.data.leaderboard)).toBe(true)
})

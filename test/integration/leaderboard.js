const test = require('ava')
const request = require('supertest')
const app = require('../../app')

const { responseList } = require('../../server/responses')

test('succeeds with goodLeaderboard', async t => {
  const resp = await request(app)
    .get(process.env.API_ENDPOINT + '/leaderboard')
    .query({ limit: 1, offset: 0 })
    .expect('Content-Type', /json/)
    .expect(responseList.goodLeaderboard.status)

  t.is(resp.body.kind, 'goodLeaderboard')
  t.truthy(Array.isArray(resp.body.data.leaderboard))
})

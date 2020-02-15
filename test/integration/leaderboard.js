const test = require('ava')
const request = require('supertest')
const app = require('../../app')

const { responses } = require('../../server/responses')

test('succeeds with goodLeaderboard', async t => {
  const resp = await request(app)
    .get(process.env.API_ENDPOINT + '/leaderboard')
    .expect('Content-Type', /json/)
    .expect(responses.goodLeaderboard.status)

  t.is(resp.body.kind, 'goodLeaderboard')
  t.truthy(Array.isArray(resp.body.data))
})

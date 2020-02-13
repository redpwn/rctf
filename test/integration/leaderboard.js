const test = require('ava')
const request = require('supertest')
const app = require('../../app')

test('returns array', async t => {
  const resp = await request(app)
    .get(process.env.API_ENDPOINT + '/leaderboard')
    .expect('Content-Type', /json/)
    .expect(200)

  t.is(resp.body.kind, 'goodLeaderboard')
  t.truthy(Array.isArray(resp.body.data))
})

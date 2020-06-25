const test = require('ava')
const request = require('supertest')
const app = require('../../dist/server/app').default

const { responseList } = require('../../dist/server/responses')

test.before('start server', async t => {
  await app.ready()
})

test('succeeds with goodLeaderboard', async t => {
  const resp = await request(app.server)
    .get(process.env.API_ENDPOINT + '/leaderboard/now')
    .query({ limit: 1, offset: 0 })
    .expect('Content-Type', /json/)
    .expect(responseList.goodLeaderboard.status)

  t.is(resp.body.kind, 'goodLeaderboard')
  t.true(Array.isArray(resp.body.data.leaderboard))
})

const test = require('ava')
const { v4: uuid } = require('uuid')
const timeouts = require('../../dist/server/cache/timeouts')

test('allows request if under ratelimit', async t => {
  const result = await timeouts.checkRateLimit({
    type: timeouts.types.UPDATE_PROFILE,
    duration: 1000 * 10,
    limit: 1,
    userid: uuid()
  })
  t.deepEqual(result, {
    ok: true,
    timeLeft: null
  })
})

test('denies request if over ratelimit', async t => {
  const userid = uuid()
  await timeouts.checkRateLimit({
    type: timeouts.types.UPDATE_PROFILE,
    duration: 1000 * 10,
    limit: 1,
    userid
  })
  const result = await timeouts.checkRateLimit({
    type: timeouts.types.UPDATE_PROFILE,
    duration: 1000 * 10,
    limit: 1,
    userid
  })
  t.false(result.ok)
  t.is(typeof result.timeLeft, 'number')
})

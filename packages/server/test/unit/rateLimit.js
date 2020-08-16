import { v4 as uuid } from 'uuid'
import * as timeouts from '../../src/cache/timeouts'

test('allows request if under ratelimit', async () => {
  const result = await timeouts.checkRateLimit({
    type: timeouts.types.UPDATE_PROFILE,
    duration: 1000 * 10,
    limit: 1,
    userid: uuid()
  })
  expect(result).toEqual({
    ok: true,
    timeLeft: null
  })
})

test('denies request if over ratelimit', async () => {
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
  expect(result.ok).toBe(false)
  expect(typeof result.timeLeft).toBe('number')
})

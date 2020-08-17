import { getScore } from '../../src/util/scores'

test('get score dynamic', () => {
  expect(typeof getScore(100, 500, 0)).toBe('number')
})

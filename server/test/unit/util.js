const util = require('../../src/util')

test('get score dynamic', () => {
  expect(typeof util.scores.getScore(100, 500, 0)).toBe('number')
})

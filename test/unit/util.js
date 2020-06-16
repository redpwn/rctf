const test = require('ava')

const util = require('../../dist/server/util')

test('get score dynamic', t => {
  t.is(util.scores.getScore(100, 500, 0), 500)
  t.is(util.scores.getScore(100, 500, 300), 100)
  t.is(util.scores.getScore(100, 500, 100), 314)
})

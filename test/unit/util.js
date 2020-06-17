const test = require('ava')

const util = require('../../dist/server/util')

test('get score dynamic', t => {
  t.is(typeof util.scores.getScore(100, 500, 0), 'number')
})

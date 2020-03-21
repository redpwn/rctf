const test = require('ava')

const util = require('../../dist/server/util')

test('get score static', t => {
  const score = util.scores.getScore('static', 100, 100, 20)

  t.is(score, 100)
})

test('get score dynamic', t => {
  const score = util.scores.getScore('dynamic', 100, 500, 20)

  t.is(score, 484)
})

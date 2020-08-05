const test = require('ava')

const util = require('../../../dist/server/config/util')

test('removeUndefined passes through properties', t => {
  const obj = {
    a: 'hello',
    b: 1,
    c: true,
    d: {
      e: 'world'
    }
  }
  t.deepEqual(util.removeUndefined(obj), obj)
})

test('removeUndefined removes all undefined properties', t => {
  const obj = {
    a: 'hello',
    b: undefined,
    c: undefined,
    d: {
      e: undefined,
      f: 'world'
    }
  }
  t.deepEqual(util.removeUndefined(obj), {
    a: 'hello',
    d: {
      f: 'world'
    }
  })
})

test('removeUndefined does not return undefined', t => {
  const obj = {
    b: undefined,
    c: undefined,
    d: {
      e: undefined,
      f: {
        g: undefined
      }
    }
  }
  t.deepEqual(util.removeUndefined(obj), {})
})

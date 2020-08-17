import { removeUndefined } from '../../../src/config/util'

test('removeUndefined passes through properties', () => {
  const obj = {
    a: 'hello',
    b: 1,
    c: true,
    d: {
      e: 'world'
    }
  }
  expect(removeUndefined(obj)).toEqual(obj)
})

test('removeUndefined removes all undefined properties', () => {
  const obj = {
    a: 'hello',
    b: undefined,
    c: undefined,
    d: {
      e: undefined,
      f: 'world'
    }
  }
  expect(removeUndefined(obj)).toEqual({
    a: 'hello',
    d: {
      f: 'world'
    }
  })
})

test('removeUndefined does not return undefined', () => {
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
  expect(removeUndefined(obj)).toEqual({})
})

import { deepCopy, omit, removeUndefined } from '../../../src/util/object'

test('deepCopy', () => {
  const getTestObject = () => ({
    a: 1,
    b: false,
    c: 'c',
    d: {
      e: true,
      f: [2, 'f', null],
    },
  })
  const original = getTestObject()
  const copied = deepCopy(original)
  expect(copied).toEqual(getTestObject())
  expect(copied).not.toBe(original)
  expect(copied.d).not.toBe(original.d)
  expect(copied.d.f).not.toBe(original.d.f)
})

describe('omit', () => {
  const getTestObject = () => ({
    a: 1,
    b: false,
    c: 'c',
    d: {
      e: true,
    },
  })

  it('does not mutate the original', () => {
    const object = getTestObject()
    const original = deepCopy(object)
    omit(object, 'a')
    expect(object).toEqual(original)
  })

  it('works for a single argument', () => {
    const object = getTestObject()
    const omitted = omit(object, 'a')
    expect(omitted).toMatchInlineSnapshot(`
      Object {
        "b": false,
        "c": "c",
        "d": Object {
          "e": true,
        },
      }
    `)
  })

  it('works for array argument', () => {
    const object = getTestObject()
    const omitted = omit(object, ['a', 'b'])
    expect(omitted).toMatchInlineSnapshot(`
      Object {
        "c": "c",
        "d": Object {
          "e": true,
        },
      }
    `)
  })

  it('keeps symbols', () => {
    const symbol = Symbol('symbol')
    const object = {
      a: 1,
      [symbol]: 'symbol',
    }
    const omitted = omit(object, 'a')
    expect(omitted).toHaveProperty([symbol])
  })
})

describe('removeUndefined', () => {
  it('passes through properties', () => {
    const obj = {
      a: 'hello',
      b: 1,
      c: true,
      d: {
        e: 'world',
      },
    }
    expect(removeUndefined(obj)).toEqual(obj)
  })

  it('removes all undefined properties', () => {
    const obj = {
      a: 'hello',
      b: undefined,
      c: undefined,
      d: {
        e: undefined,
        f: 'world',
      },
    }
    expect(removeUndefined(obj)).toEqual({
      a: 'hello',
      d: {
        f: 'world',
      },
    })
  })

  it('does not return undefined', () => {
    const obj = {
      b: undefined,
      c: undefined,
      d: {
        e: undefined,
        f: {
          g: undefined,
        },
      },
    }
    expect(removeUndefined(obj)).toEqual({})
  })
})

import { Route } from '@rctf/api-types'
import { makePathBuilder, makeQuery } from './util'

describe('makeQuery', () => {
  it('works', () => {
    expect(makeQuery({ z: 1, escaped: '& +', a: 'a' })).toMatchInlineSnapshot(
      `"a=a&escaped=%26+%2B&z=1"`
    )
  })

  it('sorts parameters', () => {
    expect(makeQuery({ a: '1', b: '2' })).toEqual(makeQuery({ b: '2', a: '1' }))
  })
})

describe('makePathBuilder', () => {
  it('works', () => {
    const route: Route<
      'goodChallenges',
      never,
      {
        qsStr: string
        qsNumber: number
      },
      {
        id: string
      },
      false
    > = {
      method: 'GET',
      path: '/challenges/:id/solves',
      requireAuth: false,
      responses: ['goodChallenges'],
    }

    const pathBuilder = makePathBuilder(route)

    expect(
      pathBuilder({
        qs: {
          qsStr: 'string!',
          qsNumber: 42,
        },
        params: {
          id: 'the_id',
        },
      })
    ).toMatchInlineSnapshot(
      `"/challenges/the_id/solves?qsNumber=42&qsStr=string%21"`
    )
  })
})

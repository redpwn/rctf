import { getScore } from '../../../src/util/scores'

describe('getScore', () => {
  it('should be valid for maxSolves = 0', () => {
    const value = getScore(100, 500, 0, 0)
    expect(typeof value).toBe('number')
    expect(value).not.toBeNaN()
  })

  it('should be valid for solves = 0', () => {
    const value = getScore(100, 500, 100, 0)
    expect(typeof value).toBe('number')
    expect(value).not.toBeNaN()
  })
})

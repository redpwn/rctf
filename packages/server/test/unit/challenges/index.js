import appFactory from 'fastify'
import { init } from '../../../src/uploads'

import { getAllChallenges } from '../../../src/challenges'
const app = appFactory()
init(app)

test('get all challenges', () => {
  const data = getAllChallenges()

  expect(Array.isArray(data)).toBe(true)
})

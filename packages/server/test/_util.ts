import { v4 as uuidv4 } from 'uuid'
import config from '../src/config/server'
import * as db from '../src/database'
import { Challenge } from '../src/challenges/types'

// Generate only valid parameters
export const generateTestUser = (): Omit<db.users.User, 'id'> => ({
  email: uuidv4() + '@test.com',
  name: uuidv4(),
  division: Object.keys(config.divisions)[0],
  perms: 0
})

// Generate a real user, adding to database
export const generateRealTestUser = async (): Promise<{
  user: db.users.User,
  cleanup: () => Promise<void>
}> => {
  const id = uuidv4()

  const userData = generateTestUser()
  const user = await db.users.makeUser({
    ...userData,
    id
  })

  return {
    user,
    cleanup: async () => { await db.users.removeUserById({ id }) }
  }
}

export const generateChallenge = async (): Promise<{
  chall: Challenge,
  cleanup: () => Promise<void>
}> => {
  // Load on-demand
  const challenges = await import('../src/challenges')
  const chall: Challenge = {
    id: uuidv4(),
    name: uuidv4(),
    description: uuidv4(),
    category: uuidv4(),
    author: uuidv4(),
    files: [],
    flag: uuidv4(),
    tiebreakEligible: true,
    points: {
      min: 100,
      max: 500
    }
  }
  await challenges.updateChallenge(chall)
  return {
    chall,
    cleanup: () => challenges.deleteChallenge(chall.id)
  }
}

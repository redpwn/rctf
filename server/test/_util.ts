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

export const getFirstLoadedChallenge = async (): Promise<Challenge> => {
  // Load on-demand
  const challenges = await import('../src/challenges')
  return new Promise((resolve, reject) => {
    const check = () => {
      try {
        const chall = challenges.getAllChallenges()[0] as Challenge | undefined
        if (chall !== undefined) {
          resolve(chall)
          return true
        }
      } catch (e) {
        reject(e)
        return false
      }
    }
    if (!check()) {
      // Poll
      const interval = setInterval(() => {
        if (check()) {
          clearInterval(interval)
        }
      }, 100)
    }
  })
}

require('ava')

const { v4: uuidv4 } = require('uuid')
const config = require('../config/server')
const db = require('../dist/server/database')

const ret = {
  // Generate only valid parameters
  generateTestUser: () => {
    return {
      email: uuidv4() + '@test.com',
      name: uuidv4(),
      division: Object.values(config.divisions)[0],
      perms: 0
    }
  },
  // Generate a real user, adding to database
  generateRealTestUser: async () => {
    const id = uuidv4()

    const userData = ret.generateTestUser()
    const user = await db.auth.makeUser({
      ...userData,
      id
    })

    return {
      user,
      cleanup: () => db.auth.removeUserById({ id })
    }
  },
  getFirstLoadedChallenge: () => {
    // Load on-demand
    const challenges = require('../dist/server/challenges')
    return new Promise((resolve, reject) => {
      const check = () => {
        try {
          const chall = challenges.getAllChallenges()[0]
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
}

module.exports = ret

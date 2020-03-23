require('ava')

const { v4: uuidv4 } = require('uuid')
const config = require('../config/server')

module.exports = {
  generateTestUser: () => {
    return {
      email: uuidv4() + '@test.com',
      name: uuidv4(),
      division: Object.values(config.divisions)[0]
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

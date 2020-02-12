const config = require('../../config')
const util = require('../util')
const path = require('path')

let challenges
// Mapping from challenge.id to challenge
const challMap = new Map()

const resetChallenges = () => {
  const module = path.join('../../', config.rDeployDirectory, 'config.json')

  challenges = util.reloadModule(module)

  challMap.clear()
  challenges.forEach(c => {
    challMap.set(c.id, c)
  })
}

resetChallenges()

module.exports = {
  getAllChallenges: () => {
    return challenges
  },
  getChallenge: id => {
    return challMap.get(id)
  },
  resetCache: () => {
    resetChallenges()
  }
}

const config = require('../../config')
const path = require('path')

let challenges

const resetChallenges = () => {
  const module = path.join('../../', config.rDeployDirectory, 'config.json')

  delete require.cache[require.resolve(module)]
  challenges = require(module)
}

resetChallenges()

module.exports = {
  getAllChallenges: () => {
    return challenges
  },
  getChallenge: id => {
    return challenges.filter(a => a.id === id)[0]
  },
  resetCache: () => {
    resetChallenges()
  }
}

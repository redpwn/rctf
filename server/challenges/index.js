const config = require('../../config')
const util = require('../util')
const path = require('path')

let challenges
let cleanedChallenges
// Mapping from challenge.id to challenge
const challMap = new Map()

const resetChallenges = () => {
  const module = path.join('../../', config.rDeployDirectory, 'config.json')

  challenges = util.reloadModule(module)

  challMap.clear()
  challenges.forEach(c => {
    challMap.set(c.id, c)
  })

  cleanedChallenges = challenges.map(({ files, description, author, points, id, name }) => {
    const normalizedFiles = files.map(filename => {
      const cleanedName = util.normalize.normalizeDownload(filename)

      return {
        name: cleanedName,
        path: filename
      }
    })
    return {
      files: normalizedFiles,
      description,
      author,
      points,
      id,
      name,
      category: 'pwn' // TODO: Load actual categories
    }
  })
}

resetChallenges()

module.exports = {
  getAllChallenges: () => {
    return challenges
  },
  getCleanedChallenges: () => {
    return cleanedChallenges
  },
  getChallenge: id => {
    return challMap.get(id)
  },
  resetCache: () => {
    resetChallenges()
  }
}

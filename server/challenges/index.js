const config = require('../../config/server')
const util = require('../util')
const path = require('path')

const Provider = require(path.join(__dirname, 'providers', config.challengeProvider.name))

let challenges = []
let cleanedChallenges = []
// Mapping from challenge.id to challenge
const challMap = new Map()
const cleanedChallMap = new Map()

const onUpdate = (newChallenges) => {
  challenges = newChallenges

  challMap.clear()
  challenges.forEach(c => {
    challMap.set(c.id, c)
  })

  cleanedChallenges = challenges.map(({ files, description, author, points, id, name, category }) => {
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
      category
    }
  })

  cleanedChallMap.clear()
  cleanedChallenges.forEach(c => {
    cleanedChallMap.set(c.id, c)
  })
}

const provider = new Provider({
  onUpdate,
  options: config.challengeProvider.options
})

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
  getCleanedChallenge: id => {
    return cleanedChallMap.get(id)
  },
  resetCache: () => {
    provider.forceUpdate()
  }
}

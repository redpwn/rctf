import config from '../../config/server'
import util from '../util'
import path from 'path'
import { Challenge, CleanedChallenge } from './types'
import { Provider } from './Provider'

let provider: Provider

let challenges: Challenge[] = []
let cleanedChallenges: CleanedChallenge[] = []
// Mapping from challenge.id to challenge
const challMap: Map<string, Challenge> = new Map()
const cleanedChallMap: Map<string, CleanedChallenge> = new Map()

const onUpdate = (newChallenges: Challenge[]): void => {
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

import(path.join('../providers', config.challengeProvider.name))
  .then(({ default: Provider }) => {
    provider = new Provider(config.challengeProvider.options)
    provider.on('update', onUpdate)
  })

export function getAllChallenges (): Challenge[] {
  return challenges
}

export function getCleanedChallenges (): CleanedChallenge[] {
  return cleanedChallenges
}

export function getChallenge (id: string): Challenge {
  return challMap.get(id)
}

export function getCleanedChallenge (id: string): CleanedChallenge {
  return cleanedChallMap.get(id)
}
export function resetCache (): void {
  provider.forceUpdate()
}

import config from '../../config/server'
import util from '../util'
import path from 'path'
import { Challenge, CleanedChallenge } from './types'
import { Provider } from './Provider'

let provider: Provider

let challenges: Challenge[] = []
let cleanedChallenges: CleanedChallenge[] = []

const cleanChallenge = (chall: Challenge): CleanedChallenge => {
  const { files, description, author, points, id, name, category } = chall

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
}

const rebuildCleanedChallenges = (): void => {
  cleanedChallenges = challenges.map(cleanChallenge)
}

const onUpdate = (newChallenges: Challenge[]): void => {
  challenges = newChallenges

  rebuildCleanedChallenges()
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
  return challenges
    .filter(chall => chall.id === id)[0]
}

export function getCleanedChallenge (id: string): CleanedChallenge {
  return cleanedChallenges
    .filter(chall => chall.id === id)[0]
}
export function resetCache (): void {
  provider.forceUpdate()
}

export function updateChallenge (chall: Challenge): void {
  provider.updateChallenge(chall)
}

export function deleteChallenge (id: string): void {
  provider.deleteChallenge(id)
}

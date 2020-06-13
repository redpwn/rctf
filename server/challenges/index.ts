import config from '../../config/server'
import path from 'path'
import { Challenge, CleanedChallenge } from './types'
import { Provider } from './Provider'

let provider: Provider

let challenges: Challenge[] = []
let cleanedChallenges: CleanedChallenge[] = []

let challengesMap: Map<string, Challenge> = new Map()
let cleanedChallengesMap: Map<string, CleanedChallenge> = new Map()

const cleanChallenge = (chall: Challenge): CleanedChallenge => {
  const { files, description, author, points, id, name, category } = chall

  return {
    files,
    description,
    author,
    points,
    id,
    name,
    category
  }
}

const onUpdate = (newChallenges: Challenge[]): void => {
  challenges = newChallenges
  challengesMap = new Map(newChallenges.map(c => [c.id, c]))
  cleanedChallenges = challenges.map(cleanChallenge)
  cleanedChallengesMap = new Map(cleanedChallenges.map(c => [c.id, c]))
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
  return challengesMap.get(id)
}

export function getCleanedChallenge (id: string): CleanedChallenge {
  return cleanedChallengesMap.get(id)
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

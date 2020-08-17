import config from '../config/server'
import path from 'path'
import { Challenge, CleanedChallenge } from './types'
import { Provider, ProviderConstructor } from './Provider'
import { challUpdateEmitter, publishChallUpdate } from '../cache/challs'
import { EventEmitter } from 'events'

let provider: Provider

let challenges: Challenge[] = []
let cleanedChallenges: CleanedChallenge[] = []

let challengesMap = new Map<string, Challenge>()
let cleanedChallengesMap = new Map<string, CleanedChallenge>()

const cleanChallenge = (chall: Challenge): CleanedChallenge => {
  const { files, description, author, points, id, name, category, sortWeight } = chall

  return {
    files,
    description,
    author,
    points,
    id,
    name,
    category,
    sortWeight
  }
}

const onUpdate = (newChallenges: Challenge[]): void => {
  challenges = newChallenges
  challengesMap = new Map(newChallenges.map(c => [c.id, c]))
  cleanedChallenges = challenges.map(cleanChallenge)
  cleanedChallengesMap = new Map(cleanedChallenges.map(c => [c.id, c]))
}

void import(path.join('../providers', config.challengeProvider.name))
  .then(({ default: Provider }: { default: ProviderConstructor }): void => {
    provider = new Provider(config.challengeProvider.options ?? {})

    provider.on('update', onUpdate)
  })

// FIXME: remove cast once cache is typed
;(challUpdateEmitter as EventEmitter).on('update', () => {
  provider.forceUpdate()
})

export function getAllChallenges (): Challenge[] {
  return challenges
}

export function getCleanedChallenges (): CleanedChallenge[] {
  return cleanedChallenges
}

export function getChallenge (id: string): Challenge | undefined {
  return challengesMap.get(id)
}

export function getCleanedChallenge (id: string): CleanedChallenge | undefined {
  return cleanedChallengesMap.get(id)
}

export function resetCache (): void {
  provider.forceUpdate()
}

export async function updateChallenge (chall: Challenge): Promise<void> {
  await provider.updateChallenge(chall)
  await publishChallUpdate()
}

export async function deleteChallenge (id: string): Promise<void> {
  await provider.deleteChallenge(id)
  await publishChallUpdate()
}

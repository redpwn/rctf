import { Challenge } from './types'

const ChallengeDefaults: Challenge = {
  id: '',
  name: '',
  description: '',
  category: '',
  author: '',
  files: [],
  points: {
    min: 0,
    max: 0
  },
  flag: ''
}

export const applyChallengeDefaults = (chall: Challenge): Challenge => {
  const copy = JSON.parse(JSON.stringify(ChallengeDefaults))

  return {
    ...copy,
    ...chall
  }
}

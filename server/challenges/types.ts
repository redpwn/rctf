export interface Points {
  min: number;
  max: number;
}

export interface File {
  name: string;
  url: string;
}

export interface CleanedChallenge {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  files: File[];
  points: Points;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  files: File[];
  points: Points;
  flag: string;
}

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

export const patchChallenge = (chall: Challenge): Challenge => {
  const copy = JSON.parse(JSON.stringify(ChallengeDefaults))

  return {
    ...copy,
    ...chall
  }
}

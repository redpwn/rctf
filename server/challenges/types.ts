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
  tiebreakEligible: boolean;
}

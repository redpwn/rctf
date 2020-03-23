export interface Points {
  min: number;
  max: number;
}

export interface CleanedFile {
  name: string;
  path: string;
}

export interface CleanedChallenge {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  files: CleanedFile[];
  points: Points;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  files: string[];
  points: Points;
  flag: string;
}

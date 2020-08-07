import db from './db'
import { Challenge } from '../challenges/types'

export interface DatabaseChallenge {
  id: string;
  data: Omit<Challenge, 'id'>;
}

export const getAllChallenges = (): Promise<DatabaseChallenge[]> => {
  return db.query<DatabaseChallenge>('SELECT * FROM challenges')
    .then(res => res.rows)
}

export const getChallengeById = ({ id }: Pick<DatabaseChallenge, 'id'>): Promise<DatabaseChallenge | undefined> => {
  return db.query<DatabaseChallenge>('SELECT * FROM challenges WHERE id = $1', [id])
    .then(res => res.rows[0])
}

export const createChallenge = ({ id, data }: DatabaseChallenge): Promise<DatabaseChallenge> => {
  return db.query<DatabaseChallenge>('INSERT INTO challenges ($1, $2) RETURNING *',
    [id, data]
  )
    .then(res => res.rows[0])
}

export const removeChallengeById = ({ id }: Pick<DatabaseChallenge, 'id'>): Promise<DatabaseChallenge | undefined> => {
  return db.query<DatabaseChallenge>('DELETE FROM challenges WHERE id = $1 RETURNING *', [id])
    .then(res => res.rows[0])
}

export const upsertChallenge = async ({ id, data }: DatabaseChallenge): Promise<void> => {
  await db.query(`
    INSERT INTO challenges VALUES($1, $2)
      ON CONFLICT (id)
      DO UPDATE SET data = $2
    `,
  [id, data]
  )
}

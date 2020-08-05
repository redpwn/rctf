import db from './db'
import { Challenge } from '../challenges/types'
import { User } from './users'
import { ExtractQueryType } from './util'

export interface Solve {
  id: string;
  challengeid: Challenge['id'];
  userid: User['id'];
  createdat: Date;
}

export const getAllSolves = (): Promise<Solve[]> => {
  return db.query<Solve>('SELECT * FROM solves ORDER BY createdat ASC')
    .then(res => res.rows)
}

export const getSolvesByUserId = ({ userid }: Pick<Solve, 'userid'>): Promise<Solve[]> => {
  return db.query<Solve>('SELECT * FROM solves WHERE userid = $1 ORDER BY createdat DESC', [userid])
    .then(res => res.rows)
}

export const getSolvesByChallId = ({ challengeid, limit, offset }: Pick<Solve, 'challengeid'> & { limit: number; offset: number; }): Promise<(Solve & Pick<User, 'name'>)[]> => {
  return db.query<ExtractQueryType<typeof getSolvesByChallId>>('SELECT solves.id, solves.userid, solves.createdat, users.name FROM solves INNER JOIN users ON solves.userid = users.id WHERE solves.challengeid=$1 ORDER BY solves.createdat ASC LIMIT $2 OFFSET $3', [challengeid, limit, offset])
    .then(res => res.rows)
}

export const getSolveByUserIdAndChallId = ({ userid, challengeid }: Pick<Solve, 'userid' | 'challengeid'>): Promise<Solve | undefined> => {
  return db.query<Solve>('SELECT * FROM solves WHERE userid = $1 AND challengeid = $2 ORDER BY createdat DESC', [userid, challengeid])
    .then(res => res.rows[0])
}

export const newSolve = ({ id, userid, challengeid, createdat }: Solve): Promise<Solve> => {
  return db.query<Solve>('INSERT INTO solves (id, challengeid, userid, createdat) VALUES ($1, $2, $3, $4) RETURNING *', [id, challengeid, userid, createdat])
    .then(res => res.rows[0])
}

export const removeSolvesByUserId = async ({ userid }: Pick<Solve, 'userid'>): Promise<void> => {
  await db.query('DELETE FROM solves WHERE userid = $1', [userid])
}

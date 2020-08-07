import db from './db'
import * as util from '../util'
import config, { ServerConfig } from '../config/server'
import { DivisionACLError } from '../errors'
import { ExtractQueryType } from './util'

export interface User {
  id: string;
  name: string;
  email?: string;
  division: keyof ServerConfig['divisions'];
  ctftimeId?: string;
  perms: number;
}

export const getAllUsers = (): Promise<Pick<User, 'id' | 'name' | 'division'>[]> => {
  return db.query<ExtractQueryType<typeof getAllUsers>>('SELECT id, name, division FROM users')
    .then(res => res.rows)
}

export const getUserById = ({ id }: Pick<User, 'id'>): Promise<User | undefined> => {
  return db.query<User>('SELECT * FROM users WHERE id = $1', [id])
    .then(res => res.rows[0])
}

export const getUserByEmail = ({ email }: Pick<User, 'email'>): Promise<User | undefined> => {
  return db.query<User>('SELECT * FROM users WHERE email = $1', [email])
    .then(res => res.rows[0])
}

export const getUserByCtftimeId = ({ ctftimeId }: Pick<User, 'ctftimeId'>): Promise<User | undefined> => {
  return db.query<User>('SELECT * FROM users WHERE ctftime_id = $1', [ctftimeId])
    .then(res => res.rows[0])
}

export const getUserByIdAndEmail = ({ id, email }: Pick<User, 'id' | 'email'>): Promise<User | undefined> => {
  return db.query<User>('SELECT * FROM users WHERE id = $1 AND email = $2', [id, email])
    .then(res => res.rows[0])
}

export const getUserByNameOrEmail = ({ name, email }: Pick<User, 'name' | 'email'>): Promise<User | undefined> => {
  return db.query<User>('SELECT * FROM users WHERE name = $1 OR email = $2', [name, email])
    .then(res => res.rows[0])
}

export const getUserByNameOrCtftimeId = ({ name, ctftimeId }: Pick<User, 'name' | 'ctftimeId'>): Promise<User | undefined> => {
  return db.query<User>('SELECT * FROM users WHERE name = $1 OR ctftime_id = $2', [name, ctftimeId])
    .then(res => res.rows[0])
}

export const removeUserByEmail = ({ email }: Pick<User, 'email'>): Promise<User | undefined> => {
  return db.query<User>('DELETE FROM users WHERE email = $1 RETURNING *', [email])
    .then(res => res.rows[0])
}

export const removeUserById = ({ id }: Pick<User, 'id'>): Promise<User | undefined> => {
  return db.query<User>('DELETE FROM users WHERE id = $1 RETURNING *', [id])
    .then(res => res.rows[0])
}

export const makeUser = ({ id, name, email, division, ctftimeId, perms }: User): Promise<User> => {
  if (config.email && config.divisionACLs && !util.restrict.divisionAllowed(email, division)) {
    throw new DivisionACLError()
  }
  return db.query<User>('INSERT INTO users (id, name, email, division, ctftime_id, perms) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [id, name, email, division, ctftimeId, perms]
  )
    .then(res => res.rows[0])
}

export const removeCtftimeId = ({ id }: Pick<User, 'id'>): Promise<User | undefined> => {
  return db.query<User>('UPDATE users SET ctftime_id = NULL WHERE id = $1 AND ctftime_id IS NOT NULL RETURNING *', [id])
    .then(res => res.rows[0])
}

export const removeEmail = ({ id }: Pick<User, 'id'>): Promise<User | undefined> => {
  return db.query<User>('UPDATE users SET email = NULL WHERE id = $1 AND email IS NOT NULL RETURNING *', [id])
    .then(res => res.rows[0])
}

export const updateUser = async ({ id, name, email, division, ctftimeId, perms }: Pick<User, 'id'> & Partial<User>): Promise<User | undefined> => {
  if (config.email && config.divisionACLs) {
    if (!email || !division) {
      const user = await getUserById({ id })
      if (user === undefined) {
        // User does not exist, bail
        return undefined
      }
      email = email || user.email
      division = division || user.division
    }
    if (!util.restrict.divisionAllowed(email, division)) {
      throw new DivisionACLError()
    }
  }
  return db.query<User>(`
      UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        division = COALESCE($3, division),
        ctftime_id = COALESCE($4, ctftime_id),
        perms = COALESCE($5, perms)
      WHERE id = $6 RETURNING *
      `,
  [name, email, division, ctftimeId, perms, id]
  )
    .then(res => res.rows[0])
}

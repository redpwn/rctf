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
  ionId: number;
  ionData: IonData;
  perms: number;
}

export type IonData = {
  displayName: string;
  grade: number;
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

export const getUserByIonId = ({ ionId }: Pick<User, 'ionId'>): Promise<User | undefined> => {
  return db.query<User>('SELECT * FROM users WHERE ion_id = $1', [ionId])
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

export const removeUserByEmail = ({ email }: Pick<User, 'email'>): Promise<User | undefined> => {
  return db.query<User>('DELETE FROM users WHERE email = $1 RETURNING *', [email])
    .then(res => res.rows[0])
}

export const removeUserById = ({ id }: Pick<User, 'id'>): Promise<User | undefined> => {
  return db.query<User>('DELETE FROM users WHERE id = $1 RETURNING *', [id])
    .then(res => res.rows[0])
}

export const makeUser = ({ id, name, email, division, ionId, ionData, perms }: User): Promise<User> => {
  if (config.email && config.divisionACLs && !util.restrict.divisionAllowed(email, division)) {
    throw new DivisionACLError()
  }
  return db.query<User>('INSERT INTO users (id, name, email, division, ion_id, ion_data, perms) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [id, name, email, division, ionId, ionData, perms]
  )
    .then(res => res.rows[0])
}

export const updateUser = async ({ id, name, email, division, ionId, ionData, perms }: Pick<User, 'id'> & Partial<User>): Promise<User | undefined> => {
  if (config.divisionACLs) {
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
        ion_id = COALESCE($4, ion_id),
        ion_data = COALESCE($5, ion_data),
        perms = COALESCE($6, perms)
      WHERE id = $7 RETURNING *
      `,
  [name, email, division, ionId, ionData, perms, id]
  )
    .then(res => res.rows[0])
}

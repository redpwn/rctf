import db from './db'
import { User } from './users'

export interface UserMember {
  id: string;
  userid: User['id'];
  email: string;
}

export const getMembers = ({ userid }: Pick<UserMember, 'userid'>): Promise<UserMember[]> => {
  return db.query<UserMember>('SELECT * FROM user_members WHERE userid = $1', [userid])
    .then(res => res.rows)
}

export const makeMember = ({ id, userid, email }: UserMember): Promise<UserMember> => {
  return db.query<UserMember>('INSERT INTO user_members (id, userid, email) VALUES ($1, $2, $3) RETURNING *',
    [id, userid, email]
  )
    .then(res => res.rows[0])
}

export const removeMember = ({ id, userid }: Pick<UserMember, 'id' | 'userid'>): Promise<UserMember | undefined> => {
  return db.query<UserMember>('DELETE FROM user_members WHERE id = $1 and userid = $2 RETURNING *', [id, userid])
    .then(res => res.rows[0])
}

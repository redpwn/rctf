import db from './db'

export interface UserMember {
  id: string;
  userid: string; // FIXME: type via User type
  email: string;
}

export const getMembers = ({ userid }: Pick<UserMember, 'userid'>): Promise<UserMember[]> => {
  return db.query('SELECT * FROM user_members WHERE userid = $1', [userid])
    .then(res => res.rows)
}

export const makeMember = ({ id, userid, email }: UserMember): Promise<UserMember> => {
  return db.query('INSERT INTO user_members (id, userid, email) VALUES ($1, $2, $3) RETURNING *',
    [id, userid, email]
  )
    .then(res => res.rows[0])
}

export const removeMember = ({ id, userid }: Pick<UserMember, 'id' | 'userid'>): Promise<UserMember> => {
  return db.query('DELETE FROM user_members WHERE id = $1 and userid = $2 RETURNING *', [id, userid])
    .then(res => res.rows[0])
}

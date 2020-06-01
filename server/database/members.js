import db from './db'

export const getMembers = ({ userid }) => {
  return db.query('SELECT * FROM user_members WHERE userid = $1', [userid])
    .then(res => res.rows)
}

export const makeMember = ({ id, userid, email }) => {
  return db.query('INSERT INTO user_members (id, userid, email) VALUES ($1, $2, $3) RETURNING *',
    [id, userid, email]
  )
    .then(res => res.rows[0])
}

export const removeMember = ({ id, userid }) => {
  return db.query('DELETE FROM user_members WHERE id = $1 and userid = $2 RETURNING *', [id, userid])
    .then(res => res.rows[0])
}

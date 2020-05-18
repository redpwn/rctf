import db from './db'

export const getAllUsers = () => {
  return db.query('SELECT id, name, division FROM users')
    .then(res => res.rows)
}

export const getUserByUserId = ({ userid }) => {
  return db.query('SELECT * FROM users WHERE id = $1', [userid])
    .then(res => res.rows[0])
}

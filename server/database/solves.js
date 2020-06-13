import db from './db'

export const getAllSolves = () => {
  return db.query('SELECT * FROM solves ORDER BY createdat ASC')
    .then(res => res.rows)
}

export const getSolvesByUserId = ({ userid }) => {
  return db.query('SELECT * FROM solves WHERE userid = $1 ORDER BY createdat DESC', [userid])
    .then(res => res.rows)
}

export const getSolvesByChallId = ({ challengeid, limit, offset }) => {
  return db.query('SELECT * FROM solves WHERE challengeid = $1 ORDER BY createdat ASC LIMIT $2 OFFSET $3', [challengeid, limit, offset])
    .then(res => res.rows)
}

export const getSolvesByUserIdAndChallId = ({ userid, challengeid }) => {
  return db.query('SELECT * FROM solves WHERE userid = $1 AND challengeid = $2 ORDER BY createdat DESC', [userid, challengeid])
    .then(res => res.rows[0])
}

export const newSolve = ({ id, userid, challengeid, createdat }) => {
  return db.query('INSERT INTO solves (id, challengeid, userid, createdat) VALUES ($1, $2, $3, $4) RETURNING *', [id, challengeid, userid, createdat])
    .then(res => res.rows[0])
}

export const removeSolvesByUserId = ({ userid }) => {
  return db.query('DELETE FROM solves WHERE userid = $1 RETURNING *', [userid])
}

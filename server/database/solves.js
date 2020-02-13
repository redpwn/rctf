const db = require('./db')

const ret = {
  getAllSolves: () => {
    return db.query('SELECT * FROM solves')
      .then(res => res.rows)
  },
  getSolvesByUserId: ({ userid }) => {
    return db.query('SELECT * FROM solves WHERE userid = $1', [userid])
      .then(res => res.rows)
  },
  getSolvesByUserIdAndChallId: ({ userid, challengeid }) => {
    return db.query('SELECT * FROM solves WHERE userid = $1 AND challengeid = $2', [userid, challengeid])
      .then(res => res.rows[0])
  },
  newSolve: ({ id, userid, challengeid }) => {
    return db.query('INSERT INTO solves (id, challengeid, userid) VALUES ($1, $2, $3) RETURNING *', [id, challengeid, userid])
      .then(res => res.rows[0])
  },
  removeSolvesByUserId: ({ userid }) => {
    return db.query('DELETE FROM solves WHERE userid = $1', [userid])
  }
}

module.exports = ret

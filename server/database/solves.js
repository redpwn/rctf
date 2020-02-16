const db = require('./db')

const ret = {
  getAllSolves: () => {
    return db.query('SELECT * FROM solves ORDER BY createdat DESC')
      .then(res => res.rows)
  },
  getSolvesByUserId: ({ userid }) => {
    return db.query('SELECT * FROM solves WHERE userid = $1 ORDER BY createdat DESC', [userid])
      .then(res => res.rows)
  },
  getSolvesByUserIdAndChallId: ({ userid, challengeid }) => {
    return db.query('SELECT * FROM solves WHERE userid = $1 AND challengeid = $2 ORDER BY createdat DESC', [userid, challengeid])
      .then(res => res.rows[0])
  },
  newSolve: ({ id, userid, challengeid, createdat }) => {
    return db.query('INSERT INTO solves (id, challengeid, userid, createdat) VALUES ($1, $2, $3, $4) RETURNING *', [id, challengeid, userid, createdat])
      .then(res => res.rows[0])
  },
  removeSolvesByUserId: ({ userid }) => {
    return db.query('DELETE FROM solves WHERE userid = $1', [userid])
  }
}

module.exports = ret

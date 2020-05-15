const db = require('./db')

const ret = {
  getAllChallenges: () => {
    return db.query('SELECT * FROM challenges')
      .then(res => res.rows)
  },
  createChallenge: ({ id, data }) => {
    return db.query('INSERT INTO challenges ($1, $2) RETURNING *',
      [id, data]
    )
      .then(res => res.rows[0])
  },
  removeChallengeById: ({ id }) => {
    return db.query('DELETE FROM challenges WHERE id = $1 RETURNING *', [id])
      .then(res => res.rows[0])
  },
  upsertChallenge: ({ id, data }) => {
    return db.query(`
      INSERT INTO challenges VALUES($1, $2) 
        ON CONFLICT (id) 
        DO UPDATE SET data = $2
      `,
    [id, data]
    )
      .then(res => res.rows)
  }
}

module.exports = ret

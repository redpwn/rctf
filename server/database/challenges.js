const db = require('./db')

const ret = {
  getAllChallenges: () => {
    return db.query('SELECT * FROM challenges')
      .then(res => res.rows)
  },
  createChallenge: ({ id, name, description, files, author, category, points, flag }) => {
    return db.query('INSERT INTO challenges (id, name, description, files, author, category, points, flag) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, name, description, files, author, category, points, flag]
    )
      .then(res => res.rows[0])
  },
  removeChallengeById: ({ id }) => {
    return db.query('DELETE FROM challenges WHERE id = $1 RETURNING *', [id])
      .then(res => res.rows[0])
  },
  updateChallenge: ({ id, name, description, files, author, category, points, flag }) => {
    return db.query(`
      UPDATE challenges SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        files = COALESCE($3, files),
        author = COALESCE($4, author),
        category = COALESCE($5, category),
        points = COALESCE($6, points),
        flag = COALESCE($7, flag)
      WHERE id = $8 RETURNING *
      `,
    [name, description, files, author, category, points, flag, id]
    )
      .then(res => res.rows)
  }
}

module.exports = ret

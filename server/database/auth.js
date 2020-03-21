const db = require('./db')

module.exports = {
  getUserById: ({ id }) => {
    return db.query('SELECT * FROM users WHERE id = $1', [id])
      .then(res => res.rows[0])
  },
  getUserByEmail: ({ email }) => {
    return db.query('SELECT * FROM users WHERE email = $1', [email])
      .then(res => res.rows[0])
  },
  getUserByIdAndEmail: ({ id, email }) => {
    return db.query('SELECT * FROM users WHERE id = $1 AND email = $2', [id, email])
      .then(res => res.rows[0])
  },
  getUserByNameOrEmail: ({ name, email }) => {
    return db.query('SELECT * FROM users WHERE name = $1 OR email = $2', [name, email])
      .then(res => res.rows[0])
  },
  removeUserByEmail: ({ email }) => {
    return db.query('DELETE FROM users WHERE email = $1 RETURNING *', [email])
      .then(res => res.rows[0])
  },
  removeUserById: ({ id }) => {
    return db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id])
      .then(res => res.rows[0])
  },
  makeUser: ({ id, name, email, division, perms }) => {
    return db.query('INSERT INTO users (id, name, email, division, perms) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, name, email, division, perms]
    )
      .then(res => res.rows[0])
  },
  updateUser: ({ id, name, email, division, perms }) => {
    return db.query(`
      UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        division = COALESCE($3, division),
        perms = COALESCE($4, perms)
      WHERE id = $5 RETURNING *
      `,
    [name, email, division, perms, id]
    )
      .then(res => res.rows[0])
  }
}

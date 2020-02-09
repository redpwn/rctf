const db = require('./db')

const ret = {
  getUser: ({ id }) => {
    return db.query('SELECT * FROM users WHERE id = $1', [id])
      .then(res => res.rows[0])
  },
  makeUser: ({ id, name, email, division, password, perms }) => {
    return db.query('INSERT INTO users (id, name, email, division, password, perms) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, name, email, division, password, perms]
    )
      .then(res => res.rows[0])
  },
  updateUser: ({ id, name, email, division, password, perms }) => {
    return ret.getUser({ id })
      .then(user => {
        const upd = { name, email, division, password, perms }
        Object.keys(upd).forEach(key => {
          if (upd[key] === undefined) delete upd[key]
        })

        user = Object.assign(user, upd)

        return db.query('UPDATE users SET name = $1, email = $2, division = $3, password = $4, perms = $5 WHERE id = $6 RETURNING *',
          [user.name, user.email, user.division, user.password, user.perms, user.id]
        )
      })
      .then(res => res.rows[0])
  }
}

module.exports = ret

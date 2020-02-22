const db = require('./db')

const ret = {
  getAllUsers: () => {
    return db.query('SELECT id, name, division FROM users')
      .then(res => res.rows)
  },
  getUserByUserId: ({ userid }) => {
    return db.query('SELECT * FROM users WHERE id = $1', [userid])
      .then(res => res.rows[0])
  }
}

module.exports = ret

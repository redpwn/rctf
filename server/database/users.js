const db = require('./db')

const ret = {
  getAllUsers: () => {
    return db.query('SELECT id AS userid, name FROM users')
      .then(res => res.rows)
  },
  getUserByUserId: ({ userid }) => {
    return db.query('SELECT * FROM users WHERE id = $1', [userid])
      .then(res => res.rows[0])
  }
}

module.exports = ret

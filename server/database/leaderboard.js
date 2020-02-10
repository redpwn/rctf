const db = require('./db')

const ret = {
  getSolves: () => {
    return db.query('SELECT * FROM solves')
      .then(res => res.rows)
  },
  getUsers: () => {
    return db.query('SELECT id AS userid, username FROM users')
      .then(res => res.rows)
  }
}

module.exports = ret

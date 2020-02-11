const db = require('./db')

const ret = {
  getSolves: () => {
    return db.query('SELECT * FROM solves')
      .then(res => res.rows)
  }
}

module.exports = ret

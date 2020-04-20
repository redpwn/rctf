const db = require('./db')

module.exports = {
  getMembers: ({ userid }) => {
    return db.query('SELECT * FROM user_members WHERE userid = $1', [userid])
      .then(res => res.rows[0])
  },
  makeMember: ({ id, userid, name, email, grade }) => {
    return db.query('INSERT INTO user_members (id, userid, name, email, grade) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, userid, name, email, grade]
    )
      .then(res => res.rows[0])
  },
  removeMember: ({ id, userid }) => {
    return db.query('DELETE FROM user_members WHERE id = $1 and userid = $2 RETURNING *', [id, userid])
      .then(res => res.rows[0])
  }
}

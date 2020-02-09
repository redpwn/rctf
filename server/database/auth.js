const db = require("./db")

const ret = {
  getUser: ({ id }) => {
    return db.query("SELECT * FROM users WHERE id = $1", [id])
      .then(res => res.rows[0])
  },
  makeUser: ({ name, email, division, password }) => {
    return db.query("INSERT INTO users (name, email, division, password) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, email, division, password]
      )
      .then(res => res.rows[0])
  },
  updateUser: ({ id, name, email, division, password }) => {
    return ret.getUser({ id })
      .then(user => {
        const upd = {name, email, division, password};
        Object.keys(upd).forEach(key => {
          if(upd[key] === undefined) delete upd[key];
        });

        user = Object.assign(user, upd);

        return db.query("UPDATE users SET name = $1, email = $2, division = $3, password = $4 WHERE id = $5 RETURNING *",
            [user.name, user.email, user.division, user.password, user.id]
          )
      })
      .then(res => res.rows[0])
  }
}

module.exports = ret;

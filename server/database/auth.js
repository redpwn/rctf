const { Pool } = require("pg");

// assuming connection will be pooled, since scalability seems to be a priority
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB,
})

pool.on("error", (err, client) => {
  // TODO: actually handle pool errors in case something goes wrong
  // for now we just commit seppeku
  pool.end()
  throw err;
})

// db operations should be async since they like to take time
// for now, database will have CRUD capabilities
module.exports = {
  /* removed destructuring of parameter since the purpose of this function is get a user so there wouldn't be a user
  to destructure in the first place. Add destructuring back if you're passing in another object that has the attribute
  'id'. */
  getUser: async (id) => {
    const client = await pool.connect();
    try {
      const res = await client.query("select name, email, division, password from users where id = $1", [id]);
      client.release();
      return {
        name: res.rows[0],
        email: res.rows[1],
        division: res.rows[2],
        password: res.rows[3]
      };
    } catch (err) {
      client.release();
      console.error(err)
      // returning null if there's an error, update to what you want it to return instead
      return null;
    }
  },
  makeUser: async ({ id, name, email, division, password }) => {
    const client = await pool.connect();
    try {
      await client.query("insert into users(id, name, email, division, password) values ($1, $2, $3, $4, $5)", [id, name, email, division, password]);
    } catch (err) {
      console.error(err);
    } finally {
      client.release();
    }
  },
  updateUser: async ({ id, name, email, division, password }) => {
    const client = await pool.connect();
    try {
      await client.query("update users set name = $1, email = $2, division = $3, password = $4", [name, email, division, password]);
    } catch(err) {
      console.error(err);
    } finally {
      client.release();
    }
  },
  removeUser: async ({id}) => {
    const client = await pool.connect();
    try {
      await client.query("delete from users where id = $1", [id]);
    } catch(err) {
      console.error(err);
    } finally {
      client.release();
    }
  }
}


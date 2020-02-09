const connectionString = process.env.DATABASE_URL;

const { Pool } = require("pg")
const pool = new Pool({
  connectionString
})

module.exports = pool

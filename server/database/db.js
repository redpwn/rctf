const config = require('../../config/server')

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: config.databaseUrl
})

module.exports = pool

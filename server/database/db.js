import config from '../../config/server'
import { Pool } from 'pg'

const creds = config.database.sql

let pool

// connection string
if (typeof creds === 'string') {
  pool = new Pool({
    connectionString: creds
  })
} else {
  const { host, port, username, password, database } = creds
  pool = new Pool({
    host,
    port,
    user: username,
    password,
    database
  })
}

export default pool

import config from '../config/server'
import { Pool } from 'pg'

const creds = config.database.sql

let pool: Pool

// connection string
if (typeof creds === 'string') {
  pool = new Pool({
    connectionString: creds
  })
} else {
  pool = new Pool(creds)
}

export default pool

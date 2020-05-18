import config from '../../config/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: config.databaseUrl
})

export default pool

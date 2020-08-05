import path from 'path'
import pgMigrate from 'node-pg-migrate'
import config from '../config/server'

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time))

const migrate = async (attempt: number): Promise<void> => {
  try {
    await pgMigrate({
      databaseUrl: config.database.sql,
      dir: path.join(__dirname, '../../migrations'),
      direction: 'up',
      migrationsTable: 'pgmigrations',
      verbose: true,
      count: Infinity
    })
  } catch (e) {
    if (attempt > 10) {
      throw e
    }
    console.error(e)
    await sleep(2000 + attempt * 1000)
    return migrate(attempt + 1)
  }
}

export default (): Promise<void> => migrate(0)

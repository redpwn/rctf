import path from 'path'
import pgMigrate from 'node-pg-migrate'
import config from '../../config/server'

const sleep = (time) => new Promise(resolve => setTimeout(resolve, time))

const migrate = async (attempt) => {
  try {
    await pgMigrate({
      databaseUrl: config.database.sql,
      dir: path.join(__dirname, '../../migrations'),
      direction: 'up',
      verbose: true
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

export default () => migrate(0)

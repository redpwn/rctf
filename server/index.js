import 'dotenv/config'

import config from '../config/server'
import migrate from './database/migrate'
import { init as uploadProviderInit } from './uploads'

(async () => {
  if (config.database.migrate === 'before') {
    await migrate()
  } else if (config.database.migrate === 'only') {
    await migrate()
    return
  } else if (config.database.migrate !== 'never') {
    throw new Error('migration config not recognized')
  }

  if (config.instanceType === 'frontend' || config.instanceType === 'all') {
    const port = process.env.PORT || 3000

    const { default: app } = await import('./app')
    app.listen(port, () => console.log(`Started server at port ${port}`))
  } else {
    uploadProviderInit(null)
  }
  if (config.instanceType === 'leaderboard' || config.instanceType === 'all') {
    const { startUpdater } = await import('./leaderboard')
    startUpdater()
    console.log('Started leaderboard updater')
  }
})()

import 'dotenv/config'

import config from './config/server'

const runMigrations = async () => {
  const { default: migrate } = await import('./database/migrate')
  await migrate()
}

const runMain = async () => {
  const { subscribeChallUpdate } = await import('./cache/challs')

  await subscribeChallUpdate()

  if (config.instanceType === 'frontend' || config.instanceType === 'all') {
    const port = process.env.PORT || 3000

    const { default: app } = await import('./app')
    app.listen(port, '::', err => {
      if (err) {
        app.log.error(err)
      }
    })
  } else {
    const { init: uploadProviderInit } = await import('./uploads')

    uploadProviderInit(null)
  }
  if (config.instanceType === 'leaderboard' || config.instanceType === 'all') {
    const { startUpdater } = await import('./leaderboard')
    startUpdater()
    console.log('Started leaderboard updater')
  }
}

(async () => {
  switch (config.database.migrate) {
    case 'before':
      await runMigrations()
      await runMain()
      break
    case 'only':
      await runMigrations()
      break
    case 'never':
      await runMain()
      break
    default:
      throw new Error('migration config not recognized')
  }
})()

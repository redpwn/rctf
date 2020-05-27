import 'dotenv/config'

import config from '../config/server'
import migrate from './database/migrate'

(async () => {
  if (config.database.migrate === 'before') {
    await migrate()
  } else if (config.database.migrate === 'only') {
    await migrate()
    return
  } else if (config.database.migrate !== 'never') {
    throw new Error('migration config not recognized')
  }

  const PORT = process.env.PORT || 3000

  const { default: app } = await import('./app')
  app.listen(PORT, () => console.log(`Started server at port ${PORT}`))
})()

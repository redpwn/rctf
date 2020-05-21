import 'dotenv/config'

import config from '../config/server'
import migrate from './database/migrate'

(async () => {
  if (config.database.migrate) {
    await migrate()
  }

  const PORT = process.env.PORT || 3000

  const { default: app } = await import('./app')
  app.listen(PORT, () => console.log(`Started server at port ${PORT}`))
})()

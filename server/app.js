import path from 'path'
import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import helmet from 'fastify-helmet'
import { enableCORS, serveIndex } from './util'
import { init as uploadProviderInit } from './uploads'
import { startUpdater as leaderboardStartUpdater } from './leaderboard'
import api from './api'

leaderboardStartUpdater()

const app = fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
})

// Compression testing should be done in development only
if (process.env.NODE_ENV !== 'production' && process.env.TEST_COMPRESSION !== undefined) {
  const compression = require('compression')
  app.use(compression({
    level: 9,
    filter: () => true
  }))
}

app.register(enableCORS)
app.register(helmet, {
  dnsPrefetchControl: true,
  referrerPolicy: { policy: 'same-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ['fonts.gstatic.com', "'self'", 'data:'],
      styleSrc: ['fonts.googleapis.com', "'unsafe-inline'", "'self'"],
      imgSrc: ['*', 'data:']
    }
  }
})

uploadProviderInit(app)

app.register(api, { prefix: '/api/v1/' })

const staticPath = path.join(__dirname, '../build')

app.register(serveIndex, {
  indexPath: path.join(staticPath, 'index.html')
})
app.register(fastifyStatic, {
  root: staticPath
})

export default app

import path from 'path'
import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import helmet from 'fastify-helmet'
import hyperid from 'hyperid'
import { enableCORS, serveIndex, getRealIp } from './util'
import { init as uploadProviderInit } from './uploads'
import api from './api'

const app = fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    serializers: {
      // From https://github.com/fastify/fastify/blob/2.x/lib/logger.js#L54
      req: (req) => ({
        method: req.method,
        url: req.url,
        version: req.headers['accept-version'],
        hostname: req.hostname,
        remoteAddress: getRealIp(req),
        remotePort: req.connection.remotePort
      })
    },
    genReqId: hyperid()
  }
})

app.addHook('onRequest', async (req, reply) => {
  req.ip = getRealIp(req)
})

app.register(enableCORS)
app.register(helmet, {
  dnsPrefetchControl: false,
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

import path from 'path'
import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import helmet from 'fastify-helmet'
import hyperid from 'hyperid'
import config from './config/server'
import { serveIndex, getRealIp } from './util'
import { init as uploadProviderInit } from './uploads'
import api, { logSerializers as apiLogSerializers } from './api'

const app = fastify({
  trustProxy: config.proxy.trust,
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    serializers: {
      // From https://github.com/fastify/fastify/blob/v3.0.2/lib/logger.js#L49
      req: (req) => ({
        method: req.method,
        url: req.url,
        version: req.headers['accept-version'],
        hostname: req.hostname,
        remoteAddress: getRealIp(req),
        remotePort: req.connection.remotePort,
        userAgent: req.headers['user-agent']
      })
    }
  },
  genReqId: hyperid()
})

app.addHook('onRequest', async (req, reply) => {
  Object.defineProperty(req, 'ip', {
    get () { return getRealIp(this) }
  })
})

app.register(helmet, {
  dnsPrefetchControl: false,
  referrerPolicy: { policy: 'origin-when-cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'none\''],
      styleSrc: ['\'unsafe-inline\'', '\'self\''],
      scriptSrc: ['\'self\'', 'https://www.google-analytics.com'],
      connectSrc: ['\'self\'', 'https://www.google-analytics.com'],
      imgSrc: ['*', 'data:']
    }
  }
})

uploadProviderInit(app)

app.register(api, {
  prefix: '/api/v1/',
  logSerializers: apiLogSerializers
})

const staticPath = path.join(__dirname, '../build')

app.register(serveIndex, {
  indexPath: path.join(staticPath, 'index.html')
})
app.register(fastifyStatic, {
  root: staticPath,
  setHeaders: (res, path) => {
    if (/\.[0-9a-f]{5}\.((esm\.)?js|css)$/.test(path)) {
      res.setHeader('Cache-Control', 'public, immutable, max-age=31536000')
    }
  }
})

export default app

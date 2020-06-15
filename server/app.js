import path from 'path'
import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import helmet from 'fastify-helmet'
import hyperid from 'hyperid'
import { enableCORS, serveIndex, getRealIp } from './util'
import { init as uploadProviderInit } from './uploads'
import api, { logSerializers as apiLogSerializers } from './api'

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
        remotePort: req.connection.remotePort,
        userAgent: req.headers['user-agent']
      })
    }
  },
  genReqId: hyperid()
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

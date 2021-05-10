import path from 'path'
import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import hyperid from 'hyperid'
import config from './config/server'
import { serveIndex, getRealIp } from './util'
import { init as uploadProviderInit } from './uploads'
import api, { logSerializers as apiLogSerializers } from './api'
import { distDir as clientDistDir } from '@rctf/client'

const app = fastify({
  trustProxy: config.proxy.trust,
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    serializers: {
      // From https://github.com/fastify/fastify/blob/v3.15.1/lib/logger.js#L49
      req: req => ({
        method: req.method,
        url: req.url,
        version: req.headers['accept-version'],
        hostname: req.hostname,
        remoteAddress: getRealIp(req),
        remotePort: req.socket.remotePort,
        userAgent: req.headers['user-agent'],
      }),
    },
  },
  genReqId: hyperid(),
})

app.addHook('onRequest', async (req, reply) => {
  Object.defineProperty(req, 'ip', {
    get() {
      return getRealIp(this)
    },
  })
  reply.headers({
    'referrer-policy': 'no-referrer',
    'content-security-policy':
      "default-src 'none';style-src 'unsafe-inline';script-src 'self';connect-src 'self';img-src *",
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
  })
})

uploadProviderInit(app)

app.register(api, {
  prefix: '/api/v1/',
  logSerializers: apiLogSerializers,
})

const staticPath = process.env.RCTF_STATIC_PATH || clientDistDir

app.register(serveIndex, {
  indexPath: path.join(staticPath, 'index.html'),
})
app.register(fastifyStatic, {
  root: staticPath,
  setHeaders: (res, path) => {
    if (path.startsWith('/assets/')) {
      res.setHeader('cache-control', 'public, immutable, max-age=31536000')
    }
  },
})

export default app

import config from '../../config/server'
import clientConfig from '../../config/client'
import { promises as fs } from 'fs'
import mustache from 'mustache'
import fastifyCors from 'fastify-cors'
import { responses } from '../responses'

export * as normalize from './normalize'
export * as scores from './scores'
export * as email from './email'

export const notStarted = () => {
  return [
    responses.badNotStarted,
    {
      startTime: config.startTime
    }
  ]
}

// This function does not work for non JSON stringifiable objects
export const deepCopy = data => {
  return JSON.parse(JSON.stringify(data))
}

export const reloadModule = m => {
  delete require.cache[require.resolve(m)]
  return require(m)
}

export const enableCORS = async (fastify, opts) => {
  if (config.corsOrigin !== undefined) {
    fastify.use(fastifyCors, {
      origin: config.corsOrigin,
      allowedHeaders: ['Authorization', 'Content-Type'],
      methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE']
    })
  }
}

export const serveIndex = async (fastify, opts) => {
  const indexTemplate = (await fs.readFile(opts.indexPath)).toString()

  const rendered = mustache.render(indexTemplate, {
    config: JSON.stringify(clientConfig),
    ctfName: clientConfig.ctfName,
    meta: clientConfig.meta
  })

  const routeHandler = async (req, res) => {
    res.type('text/html; charset=UTF-8')
    res.send(rendered)
  }
  fastify.get('/', routeHandler)
  fastify.get('/index.html', routeHandler)
  fastify.setNotFoundHandler(routeHandler)
}

// Parse Cloudflare CF-Connecting-IP header
export const getRealIp = (req) => {
  return req.headers['cf-connecting-ip'] || req.ip
}

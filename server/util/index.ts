import config from '../config/server'
import clientConfig from '../config/client'
import { promises as fs } from 'fs'
import mustache from 'mustache'
import { FastifyPluginAsync, FastifyRequest, RouteHandlerMethod } from 'fastify'

export * as normalize from './normalize'
export * as validate from './validate'
export * as scores from './scores'
export * as restrict from './restrict'
export * as recaptcha from './recaptcha'

/**
 * Perform a deep-copy of a JSON-stringifiable object
 */
export const deepCopy = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data)) as T
}

export const serveIndex: FastifyPluginAsync<{ indexPath: string; }> = async (fastify, opts) => {
  const indexTemplate = (await fs.readFile(opts.indexPath)).toString()

  const rendered = mustache.render(indexTemplate, {
    jsonConfig: JSON.stringify(clientConfig),
    config: {
      ...clientConfig,
      renderGoogleAnalytics: clientConfig.globalSiteTag !== undefined
    }
  })

  const routeHandler: RouteHandlerMethod = async (req, reply) => {
    void reply.type('text/html; charset=UTF-8')
    void reply.send(rendered)
  }

  fastify.get('/', routeHandler)
  fastify.get('/index.html', async (req, reply) => reply.redirect(301, '/'))
  fastify.get('//*', async (req, reply) => reply.redirect(302, '/'))
  // Fastify bug #2466
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fastify.setNotFoundHandler(routeHandler)
}

const getFastifyIp = (req: FastifyRequest): string =>
  // Use `get` on req.__proto__ since this function is used in req's getter
  Reflect.get(Object.getPrototypeOf(req), 'ip', req) as typeof req.ip

// Parse Cloudflare CF-Connecting-IP header
const getCloudflareIp = (req: FastifyRequest): string | undefined =>
  req.headers['cf-connecting-ip'] as string | undefined

let getRealIp: (req: FastifyRequest) => string = getFastifyIp

if (config.proxy.cloudflare) {
  getRealIp = (req: FastifyRequest): string =>
    getCloudflareIp(req) || getFastifyIp(req)
}

export { getRealIp }

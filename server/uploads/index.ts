import config from '../../config/server'
import path from 'path'
import { Provider } from './types'
import fastify from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'

let provider: Provider = null

export const init = (app: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>): void => {
  const ProviderClass = require(path.join('../providers', config.uploadProvider.name)).default
  provider = new ProviderClass(config.uploadProvider.options, app)
}

export const get = (): Provider => {
  if (provider === null) {
    throw new Error('upload provider called before initialization')
  }

  return provider
}

import config from '../config/server'
import path from 'path'
import { Provider } from './types'
import { FastifyInstance } from 'fastify'

let provider: Provider | null = null

export const init = (app: FastifyInstance | null): void => {
  const name = app === null ? 'uploads/dummy' : config.uploadProvider.name

  // FIXME: use async loading
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ProviderClass = require(path.join('../providers', name)).default

  provider = new ProviderClass(config.uploadProvider.options, app)
}

export const get = (): Provider => {
  if (provider === null) {
    throw new Error('upload provider called before initialization')
  }

  return provider
}

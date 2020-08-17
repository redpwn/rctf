import config from '../config/server'
import path from 'path'
import { Provider, ProviderConstructor } from './provider'
import { FastifyInstance } from 'fastify'

let provider: Provider | null = null

export const init = (app: FastifyInstance | null): void => {
  const name = app === null ? 'uploads/dummy' : config.uploadProvider.name

  // FIXME: use async loading
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: ProviderClass } = require(path.join('../providers', name)) as { default: ProviderConstructor }

  provider = new ProviderClass(config.uploadProvider.options ?? {}, app)
}

export const upload = (data: Buffer, name: string): Promise<string> => {
  if (provider === null) {
    throw new Error('upload provider called before initialization')
  }

  return provider.upload(data, name)
}

export const getUrl = (sha256: string, name: string): Promise<string|null> => {
  if (provider === null) {
    throw new Error('upload provider called before initialization')
  }

  return provider.getUrl(sha256, name)
}

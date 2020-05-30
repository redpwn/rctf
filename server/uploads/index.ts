import config from '../../config/server'
import path from 'path'
import express from 'express'
import { Provider } from './types'

let provider: Provider = null

export const init = (app: express.Application | null): void => {
  const name = app === null ? 'uploads/dummy' : config.uploadProvider.name
  const ProviderClass = require(path.join('../providers', name)).default
  provider = new ProviderClass(config.uploadProvider.options, app)
}

export const get = (): Provider => {
  if (provider === null) {
    throw new Error('upload provider called before initialization')
  }

  return provider
}

import config from '../../config/server'
import clientConfig from '../../config/client'
import fs from 'fs'
import mustache from 'mustache'
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

export const reloadModule = m => {
  delete require.cache[require.resolve(m)]
  return require(m)
}

export const enableCORS = (req, res, next) => {
  if (config.origin !== undefined) {
    res.header('Access-Control-Allow-Origin', config.origin)
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT')
  }

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
}

export const serveIndex = indexPath => {
  const indexTemplate = fs.readFileSync(indexPath).toString()

  const rendered = mustache.render(indexTemplate, {
    config: JSON.stringify(clientConfig),
    ctfName: clientConfig.ctfName,
    meta: clientConfig.meta
  })

  return (req, res, next) => {
    if (req.method !== 'GET') {
      next()
      return
    }
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.send(rendered)
  }
}

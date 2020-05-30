import path from 'path'
import express from 'express'
import helmet from 'helmet'
import { enableCORS, serveIndex } from './util'
import api from './api'

export default (app) => {
  // Compression testing should be done in development only
  if (process.env.NODE_ENV !== 'production' && process.env.TEST_COMPRESSION !== undefined) {
    const compression = require('compression')
    app.use(compression({
      level: 9,
      filter: () => true
    }))
  }

  app.use(enableCORS)
  app.use(helmet({
    dnsPrefetchControl: false
  }))
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }))
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ['fonts.gstatic.com', "'self'", 'data:'],
      styleSrc: ['fonts.googleapis.com', "'unsafe-inline'", "'self'"],
      imgSrc: ['*', 'data:']
    }
  }))

  app.use(express.raw({
    type: 'application/json'
  }))

  app.use('/api/v1', api)

  const staticPath = path.join(__dirname, '../build')

  const indexRoute = serveIndex(path.join(staticPath, 'index.html'))

  // Override index.html in express.static
  app.get('/', indexRoute)
  app.get('/index.html', indexRoute)
  app.use(express.static(staticPath, { extensions: ['html'] }))
  app.use(indexRoute)

  return app
}

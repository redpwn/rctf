const path = require('path')
const express = require('express')
const helmet = require('helmet')
const { enableCORS, serveIndex } = require('./util')
const uploadProvider = require('./uploads/index')

require('./leaderboard').startUpdater()

const app = express()

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

uploadProvider.init(app)

app.use(express.raw({
  type: 'application/json'
}))

app.use('/api/v1', require('./api'))

const staticPath = path.join(__dirname, '../build')

const indexRoute = serveIndex(path.join(staticPath, 'index.html'))

// Override index.html in express.static
app.get('/', indexRoute)
app.get('/index.html', indexRoute)
app.use(express.static(staticPath, { extensions: ['html'] }))
app.use(indexRoute)

module.exports = app

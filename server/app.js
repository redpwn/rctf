const path = require('path')
const express = require('express')
const { enableCORS, serveDownloads } = require('./util')

require('./leaderboard').startUpdater()

const app = express()

if (process.env.NODE_ENV !== 'production' && process.env.TEST_COMPRESSION !== undefined) {
  const compression = require('compression')
  app.use(compression({
    level: 9,
    filter: () => true
  }))
}

app.use(enableCORS)

app.use(express.raw({
  type: 'application/json'
}))

app.use('/api/v1', require('./api'))

const staticPath = path.join(__dirname, '../build')
app.use(express.static(staticPath, { extensions: ['html'] }))
app.use(serveDownloads('/static/files'))
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    next()
    return
  }
  res.sendFile(path.join(staticPath, 'index.html'))
})

module.exports = app

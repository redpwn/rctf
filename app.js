const path = require('path')
const express = require('express')

require('./server/leaderboard').start()

const app = express()

app.use(express.raw({
  type: 'application/json'
}))

app.use('/api/v1', require('./server/api'))

const staticPath = path.join(__dirname, '/build')
app.use(express.static(staticPath, { extensions: ['html'] }))
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    next()
    return
  }
  res.sendFile(path.join(staticPath, 'index.html'))
})

module.exports = app

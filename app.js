const path = require('path')
const express = require('express')

const app = express()

app.use(express.raw({
  type: 'application/json'
}))

app.use('/api/v1', require(path.join(__dirname, '/server/api')))

const staticPath = path.join(__dirname, '/build')
app.use(express.static(staticPath, { extensions: ['html'] }))

module.exports = app

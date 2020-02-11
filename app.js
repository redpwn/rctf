const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())

app.use('/api/v1', require(path.join(__dirname, '/server/api')))

const staticPath = path.join(__dirname, '/build')
app.use(express.static(staticPath, { extensions: ['html'] }))

module.exports = app

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())

const staticPath = path.join(__dirname, '/static')
app.use(express.static(staticPath, { extensions: ['html'] }))

module.exports = app

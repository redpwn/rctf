const config = require('../../config/server')
const clientConfig = require('../../config/client')
const fs = require('fs')
const mustache = require('mustache')
const { responses } = require('../responses')
const normalize = require('./normalize')

module.exports = {
  scores: require('./scores'),
  email: require('./email'),
  normalize,
  notStarted: () => {
    return [
      responses.badNotStarted,
      {
        startTime: config.startTime
      }
    ]
  },
  reloadModule: m => {
    delete require.cache[require.resolve(m)]
    return require(m)
  },
  enableCORS: (req, res, next) => {
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
  },
  serveIndex: indexPath => {
    const indexTemplate = fs.readFileSync(indexPath).toString()

    const rendered = mustache.render(indexTemplate, {
      config: clientConfig
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
}

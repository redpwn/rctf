
const config = require('../../config')
const path = require('path')
const fs = require('fs')
const contentDisposition = require('content-disposition')
const { responses } = require('../responses')

module.exports = {
  scores: require('./scores'),
  email: require('./email'),
  auth: require('./auth'),
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
    res.header('Access-Control-Allow-Origin', config.origin)
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET, POST')

    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
    } else {
      next()
    }
  },
  serveDownloads: root => {
    if (!root.startsWith('/')) root = '/' + root
    if (!root.endsWith('/')) root = root + '/'

    return (req, res, next) => {
      if (req.method !== 'GET') return next()

      if (req.path.startsWith(root)) {
        const filename = req.path.substring(root.length)

        const filepath = path.join(config.rDeployDirectory, config.rDeployFiles, filename)

        if (filepath.startsWith(path.join(config.rDeployDirectory, config.rDeployFiles))) {
          fs.access(filepath, fs.constants.R_OK, err => {
            if (err) return next()

            const parts = filename.split('.')
            parts[0] = parts[0].split('-')[0]
            const cleanName = parts.join('.')

            return res.sendFile(filename, {
              root: path.join(config.rDeployDirectory, config.rDeployFiles),
              headers: {
                'Content-Disposition': contentDisposition(cleanName)
              }
            })
          })
        }
        // Something sketchy is happening...
      }
      return next()
    }
  }
}

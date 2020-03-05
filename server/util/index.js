
const config = require('../../config/server')
const path = require('path')
const fs = require('fs')
const contentDisposition = require('content-disposition')
const { responses } = require('../responses')
const normalize = require('./normalize')

module.exports = {
  scores: require('./scores'),
  email: require('./email'),
  auth: require('./auth'),
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
      res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    }

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

            const cleanName = normalize.normalizeDownload(filename)

            return res.sendFile(filename, {
              root: path.join(config.rDeployDirectory, config.rDeployFiles),
              headers: {
                'Content-Disposition': contentDisposition(cleanName)
              }
            })
          })

          return
        }
        // Something sketchy is happening...
      }
      return next()
    }
  }
}

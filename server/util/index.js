
const config = require('../../config')
const path = require('path')
const fs = require('fs')

module.exports = {
  scores: require('./scores'),
  email: require('./email'),
  auth: require('./auth'),
  reloadModule: m => {
    delete require.cache[require.resolve(m)]
    return require(m)
  },
  enableCORS: (req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.origin)
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET, POST')

    if (req.method === 'OPTIONS') {
      res.send(200)
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

        if (filename === path.basename(req.path)) {
          const filepath = path.join(config.rDeployDirectory, config.rDeployFiles, filename)

          if (filepath.startsWith(path.join(config.rDeployDirectory, config.rDeployFiles))) {
            if (fs.existsSync(filepath)) {
              const parts = filename.split('.')
              parts[0] = parts[0].split('-')[0]
              const cleanName = parts.join('.')

              return res.download(filepath, cleanName)
            }
          }
        }
        // Something sketchy is happening...
      }
      return next()
    }
  }
}

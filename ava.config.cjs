// Server tests - placed at root because AVA requires it
require('dotenv').config()

module.exports = {
  environmentVariables: {
    API_ENDPOINT: '/api/v1'
  },
  files: [
    'server/test/**/*.js'
  ],
  timeout: '30000'
}

const shared = require('./shared')
const server = require('./server')
const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

const config = yaml.parse(
  fs.readFileSync(path.join(__dirname, 'yml/client.yml'), 'utf-8')
)

module.exports = {
  ...shared,
  ctfTitle: ' | ' + shared.ctfName,
  verifyEmail: server.verifyEmail,
  ctftimeClientId: server.ctftimeClientId,
  ctftimeEnabled: server.ctftimeClientId !== undefined,
  ...config,
  // Convert to boolean
  showUserMembers: config.showUserMembers === 'true'
}

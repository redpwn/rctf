const shared = require('./shared')
const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

const config = yaml.parse(
  fs.readFileSync(path.join(__dirname, '/yml/client.yml'), 'utf-8')
)

module.exports = {
  ...shared,
  ctfTitle: ' | ' + shared.ctfName,
  ...config
}

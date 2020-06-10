const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

module.exports = yaml.parse(
  fs.readFileSync(path.join(__dirname, '/yml/shared.yml'), 'utf-8')
)

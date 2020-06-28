const fs = require('fs')
const path = require('path')
const yaml = require('yaml')
const { cleanConfig } = require('./util')

const envConfig = cleanConfig({
  ctftimeClientId: process.env.RCTF_CTFTIME_CLIENT_ID,
  startTime: process.env.RCTF_START_TIME,
  endTime: process.env.RCTF_END_TIME
})

const ymlConfig = yaml.parse(
  fs.readFileSync(path.join(__dirname, 'yml/shared.yml'), 'utf-8')
)

module.exports = {
  ...ymlConfig,
  ...envConfig
}

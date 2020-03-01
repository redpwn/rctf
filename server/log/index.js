const os = require('os')
const fs = require('fs')
const config = require('../../config/server')

let consumer = () => {}

const host = os.hostname()
const pid = process.pid

if (config.logFile) {
  const logStream = fs.createWriteStream(config.logFile, { flags: 'a' })

  consumer = (content) => {
    const line = JSON.stringify(content)
    logStream.write(line + '\n')
  }
}

const log = (...rest) => {
  const content = {
    time: Date.now(),
    host,
    pid,
    data: rest
  }
  consumer(content)
}

module.exports = log

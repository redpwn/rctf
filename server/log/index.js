import os from 'os'
import fs from 'fs'
import config from '../../config/server'

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

export default log

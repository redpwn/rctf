const shared = require('./shared')
const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

const config = yaml.parse(
  fs.readFileSync(path.join(__dirname, '/server.yml'), 'utf-8')
)

const envConfig = {
  database: {
    sql: process.env.RCTF_DATABASE_URL || {
      host: process.env.RCTF_DATABASE_HOST,
      port: parseInt(process.env.RCTF_DATABASE_PORT) || 5432,
      user: process.env.RCTF_DATABASE_USERNAME,
      password: process.env.RCTF_DATABASE_PASSWORD,
      database: process.env.RCTF_DATABASE_DATABASE
    },
    redis: process.env.RCTF_REDIS_URL || {
      host: process.env.RCTF_REDIS_HOST,
      port: parseInt(process.env.RCTF_REDIS_PORT) || 6379,
      password: process.env.RCTF_REDIS_PASSWORD,
      database: process.env.RCTF_REDIS_DATABASE
    },
    migrate: process.env.RCTF_DATABASE_MIGRATE || 'never' // enum: never, before, only
  },
  instanceType: process.env.RCTF_INSTANCE_TYPE || 'all' // enum: all, frontend, leaderboard
}

module.exports = {
  ...shared,
  ...envConfig,
  verifyEmail: (config.email !== undefined && config.email.smtpUrl !== undefined),
  ...config
}

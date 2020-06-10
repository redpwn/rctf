const shared = require('./shared')
const fs = require('fs')
const path = require('path')
const yaml = require('yaml')
const { cleanConfig } = require('./util')

const config = yaml.parse(
  fs.readFileSync(path.join(__dirname, 'yml/server.yml'), 'utf-8')
)

// process.env is undefined when unset, must clean
const envConfig = cleanConfig({
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
    // enum: never, before, only
    migrate: process.env.RCTF_DATABASE_MIGRATE || 'never'
  },
  // enum: all, frontend, leaderboard,
  instanceType: process.env.RCTF_INSTANCE_TYPE || 'all',
  tokenKey: process.env.RCTF_TOKEN_KEY,
  origin: process.env.RCTF_ORIGIN,
  ctftimeClientSecret: process.env.RCTF_CTFTIME_CLIENT_SECRET,
  email: {
    smtpUrl: process.env.RCTF_SMTP_URL,
    from: process.env.RCTF_EMAIL_FROM
  }
})

const finalConfig = {
  ...shared,
  verifyEmail: (config.email !== undefined && config.email.smtpUrl !== undefined),
  ...config,
  ...envConfig
}

module.exports = finalConfig

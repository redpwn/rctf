const shared = require('./shared')
const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

// Removes undefined values
const cleanConfig = config => {
  for (const key of Object.keys(config)) {
    if (config[key] === undefined) {
      delete config[key]
    }
  }
  return config
}

const config = yaml.parse(
  fs.readFileSync(path.join(__dirname, '/yml/server.yml'), 'utf-8')
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
  origin: process.env.RCTF_ORIGIN
})

const finalConfig = {
  ...shared,
  verifyEmail: (config.email !== undefined && config.email.smtpUrl !== undefined),
  ...config,
  ...envConfig
}

module.exports = finalConfig

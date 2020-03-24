const ret = {
  rDeployDirectory: '.rdeploy',
  rDeployFiles: 'files',
  verifyEmail: false,
  removeDownloadHashes: true,
  tokenKey: process.env.RCTF_TOKEN_KEY,
  ctfName: process.env.RCTF_NAME,
  origin: process.env.RCTF_ORIGIN,
  databaseUrl: process.env.RCTF_DATABASE_URL,
  redisUrl: process.env.RCTF_REDIS_URL,
  smtpUrl: process.env.RCTF_SMTP_URL,
  emailFrom: process.env.RCTF_EMAIL_FROM,
  logFile: process.env.RCTF_LOG_FILE,
  loginTimeout: 10 * 60 * 1000,
  leaderboardUpdateInterval: 10 * 1000,
  leaderboardMaxLimit: 100,
  leaderboardMaxOffset: 2 ** 32,
  graphSampleTime: 10 * 60 * 1000,
  graphMaxTeams: 10,
  startTime: Date.now() - 24 * 60 * 60 * 1000,
  endTime: Date.now() + 24 * 60 * 60 * 1000
}

const shared = require('./shared')
Object.entries(shared).forEach(([key, val]) => {
  if (ret[key] === undefined) ret[key] = val
})

module.exports = ret

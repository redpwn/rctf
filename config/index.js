module.exports = {
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
  divisions: {
    eligible: 0,
    ineligible: 1
  },
  loginTimeout: 10 * 60 * 1000,
  leaderboardUpdateInterval: 10 * 1000,
  leaderboardMaxLimit: 2 ** 32,
  leaderboardMaxOffset: 2 ** 32,
  startTime: Date.now(),
  endTime: Date.now() + 24 * 60 * 60 * 1000
}

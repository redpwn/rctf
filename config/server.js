const config = {
  ...require('./shared'),
  challengeProvider: {
    name: 'challenges/rdeploy-blob',
    options: {
      rDeployDirectory: '.rdeploy',
      rDeployFiles: 'files',
      updateInterval: 60 * 1000
    }
  },
  uploadProvider: {
    name: 'uploads/local',
    options: {
      uploadDirectory: 'uploads',
      endpoint: '/uploads'
    }
  },
  serverOrigin: process.env.RCTF_ORIGIN,
  verifyEmail: false,
  removeDownloadHashes: true,
  tokenKey: process.env.RCTF_TOKEN_KEY,
  origin: process.env.RCTF_ORIGIN,
  databaseUrl: process.env.RCTF_DATABASE_URL,
  redisUrl: process.env.RCTF_REDIS_URL,
  smtpUrl: process.env.RCTF_SMTP_URL,
  emailFrom: process.env.RCTF_EMAIL_FROM,
  logFile: process.env.RCTF_LOG_FILE,
  ctftimeClientId: process.env.RCTF_CTFTIME_CLIENT_ID,
  ctftimeClientSecret: process.env.RCTF_CTFTIME_CLIENT_SECRET,
  loginTimeout: 10 * 60 * 1000,
  leaderboardUpdateInterval: 10 * 1000,
  leaderboardMaxLimit: 100,
  leaderboardMaxOffset: 2 ** 32,
  graphSampleTime: 10 * 60 * 1000,
  graphMaxTeams: 10,
  startTime: Date.now() - 24 * 60 * 60 * 1000,
  endTime: Date.now() + 24 * 60 * 60 * 1000
}

module.exports = config
